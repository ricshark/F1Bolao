import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const BOT_NAMES = [
    // Brasileiros
    "João Silva", "Maria Oliveira", "Antônio Santos", "Francisca Ferreira", "Carlos Rodrigues",
    "Paulo Almeida", "Lucas Pereira", "Luiz Carvalho", "Marcos Lopes", "José Souza",
    "Ana Costa", "Adriana Gomes", "Juliana Martins", "Márcia Barbosa", "Fernanda Rocha",
    "Patrícia Ribeiro", "Sônia Cavalcanti", "Camila Dias", "Bruna Castro", "Renata Lima",
    "Ricardo Shark", "Bruno Furlan", "Thiago Souza", "Rafael Mendes", "Gabriel Barbosa",
    // Internacionais
    "John Smith", "Emma Johnson", "Michael Williams", "Olivia Brown", "William Jones",
    "Sophia Garcia", "James Miller", "Isabella Davis", "Benjamin Rodriguez", "Mia Martinez",
    "Lucas Hernandez", "Charlotte Lopez", "Henry Gonzalez", "Amelia Wilson", "Alexander Anderson",
    "Evelyn Taylor", "Daniel Thomas", "Harper Moore", "Matthew Jackson", "Evelyn Martin",
    "Sebastian Lee", "Abigail Perez", "Jack Thompson", "Sofia White", "Leo Harris"
];

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Check if bots already exist to avoid duplicates
        const existingBotsCount = await User.countDocuments({ isBot: true });
        if (existingBotsCount >= 50) {
            return NextResponse.json({ message: "Bots already created." });
        }

        const hashedPassword = await bcrypt.hash("f1bolao_bot_password", 10);
        
        const botsToCreate = [];
        for (let i = 0; i < BOT_NAMES.length; i++) {
            const name = BOT_NAMES[i];
            const email = `bot_${name.toLowerCase().replace(/\s+/g, '_')}@f1bolao.com`;
            
            // Check if email exists
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                botsToCreate.push({
                    name,
                    email,
                    password: hashedPassword,
                    isBot: true,
                    points: 0
                });
            }
        }

        if (botsToCreate.length > 0) {
            await User.insertMany(botsToCreate);
        }

        return NextResponse.json({ 
            message: `Created ${botsToCreate.length} bots.`,
            totalBots: await User.countDocuments({ isBot: true })
        });

    } catch (error: any) {
        console.error("Error setting up bots:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
