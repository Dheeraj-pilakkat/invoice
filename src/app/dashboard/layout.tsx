import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/layout/page-transition";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full flex flex-col">
                <Header />
                <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>
        </div>
    );
}
