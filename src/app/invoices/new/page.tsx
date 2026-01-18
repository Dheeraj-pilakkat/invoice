import { CreateInvoiceForm } from "./form";

export default function NewInvoicePage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Create New Invoice</h1>
            <CreateInvoiceForm />
        </div>
    )
}
