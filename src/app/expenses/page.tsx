import { UploadReceipt } from "@/components/expenses/upload-receipt";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { Expense } from "@prisma/client";
import { format } from "date-fns";
import { auth } from "@/auth";

export default async function ExpensesPage() {
    const session = await auth();
    const expenses = await prisma.expense.findMany({
        where: { userId: session?.user?.id },
        orderBy: { aiDate: 'desc' }
    });

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Expenses</h1>
                <p className="text-muted-foreground">Upload receipts and track your business expenses.</p>
            </div>

            <UploadReceipt />

            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No expenses recorded yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenses.map((expense: Expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="font-medium">{expense.merchant}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {expense.aiCategory}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{expense.aiDate ? format(expense.aiDate, "PP") : "N/A"}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${expense.aiAmount.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
