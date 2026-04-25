import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const BOTS_CONFIG = [
    { name: "Ayrton Senna", image: "https://i.imgur.com/8mQWpYn.jpg" },
    { name: "Michael Schumacher", image: "https://i.imgur.com/uXmR0xK.jpg" },
    { name: "Juan Manuel Fangio", image: "https://i.imgur.com/7S8lI6C.jpg" },
    { name: "Alain Prost", image: "https://i.imgur.com/Z4vB7mZ.jpg" },
    { name: "Jim Clark", image: "https://i.imgur.com/9wYp9fM.jpg" },
    { name: "Niki Lauda", image: "https://i.imgur.com/XkOqW0N.jpg" },
    { name: "Jackie Stewart", image: "https://i.imgur.com/V8tD6Uf.jpg" },
    { name: "Nelson Piquet", image: "https://i.imgur.com/9Q6m9B2.jpg" },
    { name: "Emerson Fittipaldi", image: "https://i.imgur.com/5J3m0Xw.jpg" },
    { name: "Sebastian Vettel", image: "https://i.imgur.com/yFzN8Qp.jpg" },
    { name: "Graham Hill", image: "https://i.imgur.com/G5T8oZ6.jpg" },
    { name: "Mika Häkkinen", image: "https://i.imgur.com/lO8S8kY.jpg" },
    { name: "Fernando Alonso Bot", image: "https://i.imgur.com/O6L8WzZ.jpg" },
    { name: "James Hunt", image: "https://i.imgur.com/oWfU8U9.jpg" },
    { name: "Gilles Villeneuve", image: "https://i.imgur.com/vH9v5B8.jpg" },
    { name: "Stirling Moss", image: "https://i.imgur.com/rN9S6n8.jpg" },
    { name: "Rubens Barrichello", image: "https://i.imgur.com/XqT7oXG.jpg" },
    { name: "Nigel Mansell", image: "https://i.imgur.com/vH9v5B8.jpg" },
    { name: "Mario Andretti", image: "https://i.imgur.com/8mQWpYn.jpg" },
    { name: "Jack Brabham", image: "https://i.imgur.com/Z4vB7mZ.jpg" }
];

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Reset bots to ensure we have the new legendary ones
        await User.deleteMany({ isBot: true });

        const hashedPassword = await bcrypt.hash("f1bolao_bot_password", 10);
        
        const botsToCreate = [];
        for (let i = 0; i < BOTS_CONFIG.length; i++) {
            const { name, image } = BOTS_CONFIG[i];
            const email = `bot_${name.toLowerCase().replace(/\s+/g, '_')}@f1bolao.com`;
            
            // Check if email exists
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                botsToCreate.push({
                    name,
                    email,
                    image,
                    password: hashedPassword,
                    isBot: true,
                    points: Math.floor(Math.random() * 50) // Começam com alguns pontos aleatórios para simular histórico
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
