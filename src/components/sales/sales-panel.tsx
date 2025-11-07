'use client';

import { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface SalesPanelRef {
  reset: () => void;
}

export const SalesPanel = forwardRef<SalesPanelRef, {}>((props, ref) => {
  const { inventory, addItemToSale } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    reset() {
      setSelectedProduct(null);
      setSearchQuery('');
      setQuantity(1);
    }
  }));

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return inventory.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [searchQuery, inventory]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setPopoverOpen(false);
  };

  const handleAddToSale = () => {
    if (selectedProduct && Number(quantity) > 0) {
      addItemToSale(selectedProduct, Number(quantity));
      setSelectedProduct(null);
      setSearchQuery('');
      setQuantity(1);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      setPopoverOpen(true);
      const exactMatch = inventory.find(p => p.name.toLowerCase() === query.toLowerCase());
      if (exactMatch) {
        setSelectedProduct(exactMatch);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setPopoverOpen(false);
      setSelectedProduct(null);
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        setQuantity('');
    } else {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0) {
            setQuantity(numValue);
        }
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Registrar Venta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="product-search" className="text-sm font-medium">Buscar Producto</label>
            <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="product-search"
                            placeholder="Escribe el nombre del producto..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => { if (searchQuery) setPopoverOpen(true); }}
                            onBlur={() => {
                                setTimeout(() => setPopoverOpen(false), 150);
                            }}
                            className="pl-10"
                            autoComplete="off"
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    {filteredProducts.length > 0 ? (
                    <div className="flex flex-col">
                        {filteredProducts.map(product => (
                        <Button
                            key={product.id}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handleSelectProduct(product)}
                        >
                            {product.name} - ${product.price}
                        </Button>
                        ))}
                    </div>
                    ) : (
                    <p className="p-4 text-sm text-muted-foreground">No se encontraron productos.</p>
                    )}
                </PopoverContent>
            </Popover>
        </div>
        
        {selectedProduct && (
            <div className="p-4 bg-secondary rounded-md space-y-4 animate-in fade-in-50">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-secondary-foreground">{selectedProduct.name}</p>
                        <p className="text-sm text-muted-foreground">${selectedProduct.price.toFixed(2)} / unidad</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input 
                            type="text" 
                            className="w-16 h-8 text-center" 
                            value={quantity}
                            onChange={handleQuantityChange}
                            onBlur={() => {
                                if (quantity === '' || Number(quantity) < 1) {
                                    setQuantity(1);
                                }
                            }}
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Number(q) + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                 <Button onClick={handleAddToSale} className="w-full" disabled={!quantity || Number(quantity) < 1}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar a la Venta
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
});

SalesPanel.displayName = 'SalesPanel';
