'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Minus, X } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Helper function to remove accents
const normalizeString = (str: string) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function SalesPanel() {
  const { inventory, addItemToSale, saleItems } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When the sale is cleared, reset the local state of this panel
    if (saleItems.length === 0) {
      setSearchQuery('');
      setSelectedProduct(null);
      setQuantity(1);
      setPopoverOpen(false);
    }
  }, [saleItems]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    
    const normalizedQuery = normalizeString(searchQuery);
    
    return inventory.filter(product =>
      normalizeString(product.name).startsWith(normalizedQuery)
    ).slice(0, 10);
  }, [searchQuery, inventory]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setPopoverOpen(false);
    inputRef.current?.blur();
  };

  const handleAddToSale = () => {
    if (selectedProduct && Number(quantity) > 0) {
      addItemToSale(selectedProduct, Number(quantity));
      // Reset after adding
      resetSearch();
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedProduct(null); 
    if (query && filteredProducts.length > 0) {
        setPopoverOpen(true);
    } else {
        setPopoverOpen(false);
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

  const resetSearch = () => {
    setSearchQuery('');
    setSelectedProduct(null);
    setQuantity(1);
    setPopoverOpen(false);
  };


  // Update popover visibility when filteredProducts changes
  useEffect(() => {
    setPopoverOpen(!!searchQuery && filteredProducts.length > 0 && !selectedProduct);
  }, [searchQuery, filteredProducts, selectedProduct]);

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
                            ref={inputRef}
                            placeholder="Escribe el nombre del producto..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onBlur={() => setTimeout(() => setPopoverOpen(false), 150)} // Delay to allow click on popover
                            onFocus={() => setPopoverOpen(!!searchQuery && filteredProducts.length > 0 && !selectedProduct)}
                            className="pl-10 pr-10" // Add pr-10 for the clear button
                            autoComplete="off"
                        />
                        {searchQuery && (
                            <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={resetSearch}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Limpiar búsqueda</span>
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <div className="flex flex-col">
                        {filteredProducts.map(product => (
                        <Button
                            key={product.id}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handleSelectProduct(product)}
                        >
                            {product.name} - ${product.price.toFixed(2)}
                        </Button>
                        ))}
                    </div>
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
}
