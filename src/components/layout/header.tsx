import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { auth } from "@/auth";

export async function Header() {
    const session = await auth();

    return (
        <div className="flex items-center p-4 border-b h-16 bg-white dark:bg-slate-950">
            <MobileSidebar />
            <div className="flex w-full justify-end items-center gap-x-4">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-x-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                        {session?.user?.email?.[0].toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium hidden md:block">
                        {session?.user?.name || session?.user?.email}
                    </span>
                </div>
            </div>
        </div>
    );
}
