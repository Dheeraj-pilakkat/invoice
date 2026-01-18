"use client";

import { Button } from "@/components/ui/button";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PaymentButtonProps {
    invoiceId: string;
    amount: number;
    currency: string;
    clientName: string;
    clientEmail: string;
}

export function PaymentButton({
    invoiceId,
    amount,
    currency,
    clientName,
    clientEmail
}: PaymentButtonProps) {
    const { Razorpay } = useRazorpay();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // 1. Create Order
            const response = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceId }),
            });

            if (!response.ok) {
                throw new Error("Failed to create order");
            }

            const order = await response.json();

            // 2. Options for Razorpay
            const options: RazorpayOrderOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: order.amount,
                currency: order.currency,
                name: "Smart Invoice Manager",
                description: `Invoice #${invoiceId}`,
                order_id: order.id,
                handler: async (response) => {
                    // 3. Verify Payment
                    const verifyRes = await fetch("/api/payments/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            invoiceId
                        }),
                    });

                    if (verifyRes.ok) {
                        toast.success("Payment Successful!");
                        router.refresh();
                    } else {
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    name: clientName,
                    email: clientEmail,
                },
                theme: {
                    color: "#0f172a",
                },
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handlePayment} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay Now ({currency} {amount})
        </Button>
    );
}
