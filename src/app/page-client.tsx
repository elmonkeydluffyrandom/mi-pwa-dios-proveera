'use client';
import { AppHeader } from "@/components/app-header";
import { CurrentSale } from "@/components/sales/current-sale";
import { SalesPanel } from "@/components/sales/sales-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/contexts/app-context";

export function PageClient() {
    const { isInitialized } = useAppContext();

    if (!isInitialized) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3">
                            <SalesPanel />
                        </div>
                        <div className="lg:col-span-2">
                           <CurrentSale />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-card md:px-6">
                <Skeleton className="w-48 h-8" />
                <div className="flex items-center gap-2">
                    <Skeleton className="hidden w-24 h-9 md:block" />
                    <Skeleton className="hidden w-32 h-9 md:block" />
                    <Skeleton className="hidden w-32 h-9 md:block" />
                    <Skeleton className="w-10 h-10 md:hidden" />
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                 <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 space-y-6">
                            <Skeleton className="w-full h-48" />
                            <Skeleton className="w-full h-24" />
                        </div>
                        <div className="lg:col-span-2">
                            <Skeleton className="w-full h-96" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
