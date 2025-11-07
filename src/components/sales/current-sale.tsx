'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trash2, DollarSign } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';


export function CurrentSale() {
  const { saleItems, removeItemFromSale, completeSale } = useAppContext();
  const { toast } = useToast();
  const [cashReceived, setCashReceived] = useState(0);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const total = useMemo(() => saleItems.reduce((sum, item) => sum + item.subtotal, 0), [saleItems]);
  const change = useMemo(() => (cashReceived > 0 ? cashReceived - total : 0), [cashReceived, total]);
  
  useEffect(() => {
    if (saleItems.length > 0) {
      const lastItem = saleItems[saleItems.length - 1];
      if(lastItem.productId !== lastAddedId) {
        setLastAddedId(lastItem.productId);
        const timer = setTimeout(() => setLastAddedId(null), 1000);
        return () => clearTimeout(timer);
      }
    } else {
        // Reset cash received when sale is cleared
        setCashReceived(0);
    }
  }, [saleItems, lastAddedId]);

  const handleCompleteSale = async () => {
    await completeSale();
    toast({
        title: "Venta completada",
        description: `La venta por un total de $${total.toFixed(2)} ha sido registrada.`,
    });
    setCashReceived(0);
  }

  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle>Venta Actual</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0">
        <ScrollArea className="h-64 flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Precio Unit.</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleItems.length > 0 ? (
                saleItems.map(item => (
                  <TableRow key={item.productId} className={item.productId === lastAddedId ? 'animate-flash' : ''}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
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
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Efectivo recibido"
              value={cashReceived > 0 ? cashReceived : ''}
              onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
              className="text-right"
            />
          </div>
           {cashReceived > 0 && total > 0 && cashReceived >= total && (
            <div className="flex justify-between items-center text-lg font-semibold text-primary">
                <span>Cambio:</span>
                <span>${change.toFixed(2)}</span>
            </div>
           )}
           {cashReceived > 0 && total > 0 && cashReceived < total && (
             <div className="text-destructive text-sm text-center font-semibold">El efectivo recibido es menor que el total.</div>
           )}
          <Button size="lg" className="w-full" onClick={handleCompleteSale} disabled={total === 0 || cashReceived < total}>
            Completar Venta
          </Button>
        </CardFooter>
        )}
    </Card>
  );
}
