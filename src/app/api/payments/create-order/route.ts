import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { invoiceId } = body;

        if (!invoiceId) {
            return new NextResponse("Invoice ID is required", { status: 400 });
        }

        const invoice = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                userId: session.user.id
            }
        });

        if (!invoice) {
            return new NextResponse("Invoice not found", { status: 404 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const amountInPaisa = Math.round(invoice.amount * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaisa,
            currency: "INR",
            receipt: invoiceId,
        });

        // Update invoice with order ID
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { razorpayOrderId: order.id }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("[PAYMENT_CREATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
