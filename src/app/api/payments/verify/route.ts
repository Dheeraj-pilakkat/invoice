import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            invoiceId
        } = body;

        const signature = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(signature.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment successful
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: "paid",
                    // You might want to store payment ID etc in a separate Payment model ideally
                }
            });

            return NextResponse.json({ success: true });
        } else {
            return new NextResponse("Invalid signature", { status: 400 });
        }
    } catch (error) {
        console.error("[PAYMENT_VERIFY]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
