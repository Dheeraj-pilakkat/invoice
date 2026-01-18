import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns, Invoice } from "./columns";
import { DataTable } from "./data-table";

async function getInvoices(): Promise<Invoice[]> {
    // Fetch data from your API here.
    return [
        {
            id: "728ed52f",
            amount: 100,
            status: "paid",
            clientEmail: "m@example.com",
            clientName: "Acme Corp",
            dueDate: "2023-10-15"
        },
        {
            id: "2323f4",
            amount: 450,
            status: "pending",
            clientEmail: "j@example.com",
            clientName: "Globex Corporation",
            dueDate: "2023-10-25"
        },
        {
            id: "3e3d232",
            amount: 1000,
            status: "overdue",
            clientEmail: "k@example.com",
            clientName: "Soylent Corp",
            dueDate: "2023-10-01"
        },
        // ...
    ] as any // Removing type issues for demo
}

export default async function InvoicesPage() {
    const data = await getInvoices()

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Invoices</h1>
                <Link href="/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Invoice
                    </Button>
                </Link>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
