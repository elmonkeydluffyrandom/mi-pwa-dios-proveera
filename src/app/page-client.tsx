'use client';
import { useRef } from 'react';
import { AppHeader } from "@/components/app-header";
import { CurrentSale } from "@/components/sales/current-sale";
import { SalesPanel, type SalesPanelRef } from "@/components/sales/sales-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/contexts/app-context";

export function PageClient() {
    const { isInitialized, clearSale } = useAppContext();
    const salesPanelRef = useRef<SalesPanelRef>(null);

    const handleClearSale = () => {
        clearSale();
        salesPanelRef.current?.reset();
    };

    if (!isInitialized) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid gap-6 md:grid-cols-5">
                        <div className="md:col-span-3">
                            <SalesPanel ref={salesPanelRef} />
                        </div>
                        <div className="md:col-span-2">
                           <CurrentSale onCompleteSale={handleClearSale} />
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
                    <Skeleton className="w-24 h-9" />
                    <Skeleton className="w-32 h-9" />
                    <Skeleton className="w-32 h-9" />
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                 <div className="container mx-auto max-w-7xl">
                    <div className="grid gap-6 md:grid-cols-5">
                        <div className="md:col-span-3 space-y-6">
                            <Skeleton className="w-full h-48" />
                            <Skeleton className="w-full h-24" />
                        </div>
                        <div className="md:col-span-2">
                            <Skeleton className="w-full h-96" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
