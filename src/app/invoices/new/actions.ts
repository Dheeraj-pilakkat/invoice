"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceFormValues } from "./schema";
import { revalidatePath } from "next/cache";

export async function createInvoice(data: InvoiceFormValues) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    // In a real app, you would create the InvoiceItems in the DB too. 
    // For this simple schema, we are just storing the aggregate for now or need to update schema to support items.
    // Wait, let's check schema.
    // The current schema just has "Invoice" and "Expense". It doesn't have "InvoiceItem".
    // I should probably add InvoiceItem to schema or just store items in a JSON field if using Postgres?
    // But since I can't easily change schema mid-flight without migration and I want to be fast,
    // I will just create the Invoice with the total amount.
    // Requirement says "Invoice details page", usually implies items.
    // I will assume for MVP we just store the total amount in the Invoice model and maybe description in notes?
    // Actually, I should probably update the schema to include items if I want to be "production ready"
    // BUT, the schema in the prompt users "Invoice" and "Expense". It DOES NOT show InvoiceItem.
    // "Invoice": { ... "expenses": "Expense[]" }
    // So maybe items aren't persisted structurally?
    // Or maybe I should just store a JSON blob for items? 
    // Let's stick to the prompt's schema and just save the invoice with the total amount.

    await prisma.invoice.create({
        data: {
            userId: session.user.id,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            amount: totalAmount,
            dueDate: data.dueDate,
            status: "draft",
            // We aren't storing line items in the prompt's schema, so we skip them for DB persistence
            // but we use them to calculate total.
        }
    });

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
}
