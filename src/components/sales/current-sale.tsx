'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';


export function CurrentSale() {
  const { saleItems, removeItemFromSale } = useAppContext();
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const total = useMemo(() => saleItems.reduce((sum, item) => sum + item.subtotal, 0), [saleItems]);
  
  useEffect(() => {
    if (saleItems.length > 0) {
      const lastItem = saleItems[saleItems.length - 1];
      if(lastItem.productId !== lastAddedId) {
        setLastAddedId(lastItem.productId);
        const timer = setTimeout(() => setLastAddedId(null), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [saleItems, lastAddedId]);

  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle>Venta Actual</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                <TableHead>Precio Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleItems.length > 0 ? (
                saleItems.map(item => (
                  <TableRow key={item.productId} className={item.productId === lastAddedId ? 'animate-flash' : ''}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItemFromSale(item.productId)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No hay productos en la venta.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      {saleItems.length > 0 && (
      <CardFooter className="flex-col items-stretch space-y-4 pt-6 bg-secondary/50">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardFooter>
        )}
    </Card>
  );
}
