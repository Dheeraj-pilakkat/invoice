import { z } from "zod";

export const invoiceFormSchema = z.object({
    // Client Info
    clientName: z.string().min(2, "Client name is required"),
    clientEmail: z.string().email("Invalid email address"),
    clientAddress: z.string().optional(),
    dueDate: z.date({
        required_error: "Due date is required",
    }),

    // Items
    items: z.array(z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be positive"),
    })).min(1, "At least one item is required"),

    // Settings
    currency: z.string().default("INR"),
    notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
