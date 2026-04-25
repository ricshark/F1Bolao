import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const response = await fetch('https://motorsport.uol.com.br/rss/f1/news/');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch RSS: ${response.status}`);
        }

        const xmlText = await response.text();

        // Extract items
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const items = [];
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null) {
            const itemContent = match[1];
            
            const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
            const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
            const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/);
            const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
            
            items.push({
                title: titleMatch ? titleMatch[1].trim() : "Notícia sem título",
                link: linkMatch ? linkMatch[1].trim() : "#",
                description: descMatch ? descMatch[1].trim().replace(/<[^>]*>?/gm, '') : "",
                date: dateMatch ? dateMatch[1].trim() : ""
            });
            
            if (items.length >= 10) break;
        }

        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching F1 news:", error);
        return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
}
