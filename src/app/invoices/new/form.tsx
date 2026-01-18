"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Plus, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { invoiceFormSchema, InvoiceFormValues } from "./schema"
import { createInvoice } from "./actions"

export function CreateInvoiceForm() {
    const router = useRouter()
    const [step, setStep] = useState(1);
    const [isPending, setIsPending] = useState(false);

    const form = useForm({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            clientName: "",
            clientEmail: "",
            clientAddress: "",
            items: [{ description: "", quantity: 1, price: 0 }],
            currency: "USD",
            notes: "",
        },
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) {
            fieldsToValidate = ['clientName', 'clientEmail', 'dueDate'];
        } else if (step === 2) {
            fieldsToValidate = ['items'];
        }

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setStep(step + 1);
        }
    }

    const prevStep = () => {
        setStep(step - 1);
    }

    const calculateTotal = () => {
        const items = form.watch("items");
        return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    }

    const onSubmit = async (data: InvoiceFormValues) => {
        setIsPending(true);
        try {
            await createInvoice(data);
            toast.success("Invoice created successfully");
            router.push("/invoices");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create invoice");
        } finally {
            setIsPending(false);
        }
    }

    const onInvalid = (errors: any) => {
        const errorFields = Object.keys(errors);
        if (errorFields.some(field => ['clientName', 'clientEmail', 'dueDate'].includes(field))) {
            setStep(1);
            toast.error("Please check Client Info errors");
        } else if (errorFields.includes('items')) {
            setStep(2);
            toast.error("Please check Items errors");
        } else {
            toast.error("Please check the form for errors");
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-8">
                <div className={cn("flex flex-col items-center", step >= 1 ? "text-primary" : "text-muted-foreground")}>
                    <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-2", step >= 1 ? "border-primary bg-primary text-white" : "border-muted-foreground")}>1</div>
                    <span className="text-sm">Client Info</span>
                </div>
                <Separator className={cn("flex-1 mx-4", step >= 2 ? "bg-primary" : "")} />
                <div className={cn("flex flex-col items-center", step >= 2 ? "text-primary" : "text-muted-foreground")}>
                    <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-2", step >= 2 ? "border-primary bg-primary text-white" : "border-muted-foreground")}>2</div>
                    <span className="text-sm">Items</span>
                </div>
                <Separator className={cn("flex-1 mx-4", step >= 3 ? "bg-primary" : "")} />
                <div className={cn("flex flex-col items-center", step >= 3 ? "text-primary" : "text-muted-foreground")}>
                    <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-2", step >= 3 ? "border-primary bg-primary text-white" : "border-muted-foreground")}>3</div>
                    <span className="text-sm">Review</span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
                    {/* Step 1: Client Info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="clientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Corp" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="clientEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="billing@acme.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button type="button" onClick={nextStep}>Next: Add Items</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Items */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-end border p-4 rounded-lg bg-card">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Web Design Service" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="w-24">
                                                <FormLabel>Qty</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.price`}
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <FormLabel>Price</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" className="w-full" onClick={() => append({ description: "", quantity: 1, price: 0 })}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>

                            <div className="flex justify-between pt-4">
                                <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>
                                <Button type="button" onClick={nextStep}>Next: Review</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-card p-6 rounded-lg border space-y-4">
                                <div className="flex justify-between border-b pb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">Invoice Summary</h3>
                                        <p className="text-muted-foreground">{form.getValues("clientName")}</p>
                                        <p className="text-sm text-muted-foreground">{form.getValues("clientEmail")}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Due Date</p>
                                        <p className="font-medium">{form.getValues("dueDate")?.toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {form.getValues("items").map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span>{item.description} (x{item.quantity})</span>
                                            <span>${(item.quantity * item.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg pt-2">
                                        <span>Total</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Thank you for your business..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between pt-4">
                                <Button type="button" variant="ghost" onClick={prevStep} disabled={isPending}>Back</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Invoice
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    )
}
