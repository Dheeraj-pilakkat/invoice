"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function UploadReceipt() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
            setAnalysisResult(null); // Reset previous analysis
        }
    };

    const analyzeReceipt = async () => {
        if (!file || !preview) return;

        setIsAnalyzing(true);
        try {
            // Convert base64 to just the data part
            const base64Image = preview.split(",")[1];

            const response = await fetch("/api/analyze-receipt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            setAnalysisResult(data);
            toast.success("Receipt analyzed successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze receipt");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveExpense = async () => {
        if (!analysisResult) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...analysisResult,
                    imageUrl: preview // in a real app, upload to blob and send URL
                }),
            });

            if (!response.ok) throw new Error("Failed to save");

            toast.success("Expense saved!");
            setFile(null);
            setPreview(null);
            setAnalysisResult(null);
            router.refresh();
        } catch (error) {
            toast.error("Failed to save expense");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition cursor-pointer relative">
                        <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        {preview ? (
                            <img src={preview} alt="Receipt" className="max-h-64 rounded-md object-contain" />
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    Drag and drop or click to upload receipt
                                </p>
                            </>
                        )}
                    </div>
                    {file && !analysisResult && (
                        <Button
                            className="w-full mt-4"
                            onClick={analyzeReceipt}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Analyze with AI
                        </Button>
                    )}
                </CardContent>
            </Card>

            {analysisResult && (
                <Card className="border-green-200 dark:border-green-900 bg-green-50/20 dark:bg-green-950/10">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                            <CheckCircle2 className="h-5 w-5" />
                            Analysis Complete
                        </div>

                        <div className="space-y-2">
                            <Label>Merchant</Label>
                            <Input
                                value={analysisResult.merchant}
                                onChange={(e) => setAnalysisResult({ ...analysisResult, merchant: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={analysisResult.amount}
                                    onChange={(e) => setAnalysisResult({ ...analysisResult, amount: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={analysisResult.date ? analysisResult.date.split('T')[0] : ''}
                                    onChange={(e) => setAnalysisResult({ ...analysisResult, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={analysisResult.category}
                                onValueChange={(val) => setAnalysisResult({ ...analysisResult, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="travel">Travel</SelectItem>
                                    <SelectItem value="meals">Meals</SelectItem>
                                    <SelectItem value="software">Software</SelectItem>
                                    <SelectItem value="supplies">Supplies</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 flex gap-2">
                            <Button
                                className="w-full"
                                onClick={saveExpense}
                                disabled={isSaving}
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Expense
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
