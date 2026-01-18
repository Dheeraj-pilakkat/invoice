'use client';

import { cn } from "@/lib/utils";
import {
    BarChart3,
    CreditCard,
    FileText,
    Home,
    LogOut,
    Receipt,
    Settings,
    Upload
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const routes = [
    {
        label: 'Dashboard',
        icon: Home,
        href: '/dashboard',
        color: "text-sky-500",
    },
    {
        label: 'Invoices',
        icon: FileText,
        href: '/invoices',
        color: "text-violet-500",
    },
    {
        label: 'Expenses',
        icon: Receipt,
        href: '/expenses',
        color: "text-pink-700",
    },
    {
        label: 'Upload Receipt',
        icon: Upload,
        href: '/expenses/upload',
        color: "text-orange-700",
    },
    {
        label: 'Payments',
        icon: CreditCard,
        href: '/payments',
        color: "text-emerald-500",
    },
    {
        label: 'Settings',
        icon: Settings,
        href: '/settings',
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8 text-blue-500"
                        >
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">
                        Smart Invoice
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div
                    onClick={() => signOut()}
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-red-500" />
                        Logout
                    </div>
                </div>
            </div>
        </div>
    );
}
