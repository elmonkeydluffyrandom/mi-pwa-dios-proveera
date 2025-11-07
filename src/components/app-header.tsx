'use client';
import { useState } from 'react';
import { ShoppingBasket, Boxes, PlusCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InventoryModal } from '@/components/inventory/inventory-modal';
import { AddProductModal } from '@/components/inventory/add-product-modal';
import { ProductSuggesterModal } from '@/components/ai/product-suggester-modal';
import { useAppContext } from '@/contexts/app-context';

export function AppHeader() {
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [isSuggesterOpen, setSuggesterOpen] = useState(false);
  const { refreshInventory } = useAppContext();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-card">
        <div className="container flex items-center justify-between h-16 max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground font-headline">
              Tienda "Dios Proveerá"
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshInventory}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refrescar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInventoryOpen(true)}>
              <Boxes className="mr-2 h-4 w-4" />
              Inventario
            </Button>
            <Button size="sm" onClick={() => setAddProductOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
             <Button variant="accent" size="sm" onClick={() => setSuggesterOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Lightbulb className="mr-2 h-4 w-4" />
              Sugerir Productos
            </Button>
          </div>
        </div>
      </header>

      <InventoryModal isOpen={isInventoryOpen} onOpenChange={setInventoryOpen} />
      <AddProductModal isOpen={isAddProductOpen} onOpenChange={setAddProductOpen} />
      <ProductSuggesterModal isOpen={isSuggesterOpen} onOpenChange={setSuggesterOpen} />
    </>
  );
}
