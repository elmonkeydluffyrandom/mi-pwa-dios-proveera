'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function SalesPanel() {
  const { inventory, addItemToSale } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [popoverOpen, setPopoverOpen] = useState(false);

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
    if (selectedProduct && quantity > 0) {
      addItemToSale(selectedProduct, quantity);
      setSelectedProduct(null);
      setSearchQuery('');
      setQuantity(1);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (selectedProduct && selectedProduct.name !== query) {
        setSelectedProduct(null);
    }
    setPopoverOpen(!!query);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Registrar Venta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="product-search" className="text-sm font-medium">Buscar Producto</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="product-search"
                            placeholder="Escribe el nombre del producto..."
                            value={searchQuery}
                            onChange={handleSearchChange}
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
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input 
                            type="number" 
                            className="w-16 h-8 text-center" 
                            value={quantity}
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                 <Button onClick={handleAddToSale} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Agregar a la Venta
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
