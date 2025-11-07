'use client';
import { useState } from 'react';
import { ShoppingBasket, Boxes, PlusCircle, Lightbulb, RotateCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InventoryModal } from '@/components/inventory/inventory-modal';
import { AddProductModal } from '@/components/inventory/add-product-modal';
import { ProductSuggesterModal } from '@/components/ai/product-suggester-modal';
import { SalesReportModal } from '@/components/sales/sales-report-modal';
import { useAppContext } from '@/contexts/app-context';

export function AppHeader() {
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [isSuggesterOpen, setSuggesterOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const { resetCurrentSale } = useAppContext();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-16 max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-7 w-7" />
            <h1 className="text-xl font-bold tracking-tight font-headline">
              Tienda "Dios Proveerá"
            </h1>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Reporte
            </Button>
            <Button variant="ghost" size="sm" onClick={resetCurrentSale}>
                <RotateCw className="mr-2 h-4 w-4" />
                Nueva Venta
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInventoryOpen(true)}>
              <Boxes className="mr-2 h-4 w-4" />
              Inventario
            </Button>
            <Button size="sm" onClick={() => setAddProductOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
             <Button variant="secondary" size="sm" onClick={() => setSuggesterOpen(true)}>
              <Lightbulb className="mr-2 h-4 w-4" />
              Sugerir Productos
            </Button>
          </div>
        </div>
      </header>

      <InventoryModal isOpen={isInventoryOpen} onOpenChange={setInventoryOpen} />
      <AddProductModal isOpen={isAddProductOpen} onOpenChange={setAddProductOpen} />
      <ProductSuggesterModal isOpen={isSuggesterOpen} onOpenChange={setSuggesterOpen} />
      <SalesReportModal isOpen={isReportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
