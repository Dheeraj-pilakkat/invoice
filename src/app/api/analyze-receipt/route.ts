import { auth } from "@/auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { image } = await req.json();

        if (!image) {
            return new NextResponse("Image required", { status: 400 });
        }

        const prompt = `Analyze this receipt image. Extract merchant name, total amount, date, and categorize it into one of: travel, marketing, supplies, software, meals, other. 
    Return strictly valid JSON in this format: 
    { 
        "merchant": "string", 
        "amount": number, 
        "date": "YYYY-MM-DD", 
        "category": "travel" | "marketing" | "supplies" | "software" | "meals" | "other", 
        "confidence": number (0-1) 
    }`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${image}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });

        const content = response.choices[0].message.content;
        // Strip code blocks if present
        const cleanContent = content?.replace(/```json/g, "").replace(/```/g, "").trim();

        if (!cleanContent) {
            throw new Error("No content returned");
        }

        const result = JSON.parse(cleanContent);
        return NextResponse.json(result);

    } catch (error) {
        console.error("[RECEIPT_ANALYSIS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
