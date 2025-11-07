'use client';
import { useState } from 'react';
import { ShoppingBasket, Boxes, PlusCircle, RotateCw, BarChart3, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InventoryModal } from '@/components/inventory/inventory-modal';
import { AddProductModal } from '@/components/inventory/add-product-modal';
import { SalesReportModal } from '@/components/sales/sales-report-modal';
import { useAppContext } from '@/contexts/app-context';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function AppHeader() {
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { clearSale } = useAppContext();

  const handleClearSale = () => {
    clearSale();
    setMobileMenuOpen(false);
  };

  const handleReportOpen = () => {
    setReportOpen(true);
    setMobileMenuOpen(false);
  }

  const handleInventoryOpen = () => {
    setInventoryOpen(true);
    setMobileMenuOpen(false);
  }

  const handleAddProductOpen = () => {
    setAddProductOpen(true);
    setMobileMenuOpen(false);
  }

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
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => clearSale()}>
                <RotateCw className="mr-2 h-4 w-4" />
                Nueva Venta
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Reporte
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInventoryOpen(true)}>
              <Boxes className="mr-2 h-4 w-4" />
              Inventario
            </Button>
            <Button size="sm" onClick={() => setAddProductOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 pt-8">
                   <Button variant="ghost" className="justify-start" size="lg" onClick={handleClearSale}>
                      <RotateCw className="mr-2 h-4 w-4" />
                      Nueva Venta
                  </Button>
                  <Button variant="ghost" className="justify-start" size="lg" onClick={handleReportOpen}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Reporte
                  </Button>
                  <Button variant="ghost" className="justify-start" size="lg" onClick={handleInventoryOpen}>
                    <Boxes className="mr-2 h-4 w-4" />
                    Inventario
                  </Button>
                  <Button size="lg" onClick={handleAddProductOpen} className="bg-accent text-accent-foreground hover:bg-accent/90 justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <InventoryModal isOpen={isInventoryOpen} onOpenChange={setInventoryOpen} />
      <AddProductModal isOpen={isAddProductOpen} onOpenChange={setAddProductOpen} />
      <SalesReportModal isOpen={isReportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
