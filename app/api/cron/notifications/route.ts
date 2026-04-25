import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SystemConfig from "@/models/SystemConfig";
import Race from "@/models/Race";
import User from "@/models/User";
import Bet from "@/models/Bet";
import NotificationLog from "@/models/NotificationLog";
import { sendBetReminderEmail } from "@/lib/email";
import { sendAlexaNotification } from "@/lib/alexa";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

// This endpoint should be triggered periodically via a cron job service (e.g. Vercel Cron, GitHub Actions)
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.CRON_SECRET || "";

    // Log de segurança para depuração (mostra apenas partes da chave)
    console.log(`[DEBUG] Header: ${authHeader ? authHeader.substring(0, 15) + '...' + authHeader.slice(-4) : 'null'}`);
    console.log(`[DEBUG] Secret: Bearer ${secret.substring(0, 4)}...${secret.slice(-4)}`);

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await dbConnect();

        const config = await SystemConfig.findOne();
        if (!config) {
            return NextResponse.json({ success: false, message: "SystemConfig not found" }, { status: 500 });
        }

        const now = new Date();

        // 1. Find the next race
        const nextRace = await Race.findOne({ date: { $gte: now } }).sort({ date: 1 });
        if (!nextRace) {
            return NextResponse.json({ success: true, message: "No upcoming races" });
        }

        // 2. Calculate time difference in hours
        const diffMs = nextRace.date.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // 3. Determine the current notification attempt based on config
        const notif1 = config.notif1Hours || 24;
        const notif2 = config.notif2Hours || 12;
        const notif3 = config.notif3Hours || 2;

        let attemptNumber = 0;
        if (diffHours <= notif3) {
            attemptNumber = 3;
        } else if (diffHours <= notif2) {
            attemptNumber = 2;
        } else if (diffHours <= notif1) {
            attemptNumber = 1;
        }

        if (attemptNumber === 0) {
            return NextResponse.json({ success: true, message: "Not yet time for notifications", diffHours });
        }

        // 4. Find all regular users
        const users = await User.find({ isAdmin: { $ne: true } });

        // 5. Find all bets for next race
        const bets = await Bet.find({ race: nextRace._id }).select('user');
        const usersWithBets = new Set(bets.map(b => b.user.toString()));

        // 6. Find all notification logs for this race & attempt
        const logs = await NotificationLog.find({ race: nextRace._id, attemptNumber });
        const notifiedUsers = new Set(logs.map(l => l.user.toString()));

        let emailsSent = 0;
        let alexaSent = 0;

        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        for (const user of users) {
             const userIdStr = user._id.toString();

             // Se já tem aposta ou já foi notificado nesta tentativa, pule
             if (usersWithBets.has(userIdStr) || notifiedUsers.has(userIdStr)) {
                 continue;
             }

             // Enviar E-mail
             if (user.email) {
                 try {
                     await sendBetReminderEmail(user.email, user.name, nextRace.name, diffDays);
                     emailsSent++;
                 } catch (e) {
                     console.error(`Error sending email to ${user.email}:`, e);
                 }
             }

             // Enviar Notificação Alexa
             if (user.alexaId) {
                 console.log(`Tentando enviar notificação Alexa para: ${user.email}`);
                 const sentObj = await sendAlexaNotification(user.alexaId, `Não se esqueça de registrar seu palpite para o ${nextRace.name}.`);
                 console.log(`Resultado notificação Alexa para ${user.email}: ${sentObj}`);
                 if (sentObj) alexaSent++;
             }

             // Registrar Log
             await NotificationLog.create({
                 user: user._id,
                 race: nextRace._id,
                 attemptNumber
             });
        }

        // Update config last notification time
        config.lastNotifProcess = new Date();
        await config.save();

        return NextResponse.json({
            success: true,
            attemptNumber,
            nextRace: nextRace.name,
            emailsSent,
            alexaSent
        });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
