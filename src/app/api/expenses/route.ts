import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { merchant, amount, category, date, imageUrl, confidence } = body;

        const expense = await prisma.expense.create({
            data: {
                userId: session.user.id,
                merchant,
                aiAmount: amount,
                aiCategory: category,
                aiDate: new Date(date),
                imageUrl: imageUrl || "",
                confidence: confidence || 0.9, // Default if not provided
                // Manual overrides can be added later
            }
        });

        return NextResponse.json(expense);

    } catch (error) {
        console.error("[CREATE_EXPENSE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
