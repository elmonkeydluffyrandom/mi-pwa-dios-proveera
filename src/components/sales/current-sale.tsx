'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';


export function CurrentSale() {
  const { saleItems, removeItemFromSale, completeAndResetSale, clearSale } = useAppContext();
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState<number | string>('');
  
  const total = useMemo(() => saleItems.reduce((sum, item) => sum + item.subtotal, 0), [saleItems]);
  const change = useMemo(() => {
    const received = typeof cashReceived === 'string' ? parseFloat(cashReceived) : cashReceived;
    if (isNaN(received) || received <= 0 || received < total) return 0;
    return received - total;
  }, [cashReceived, total]);

  useEffect(() => {
    if (saleItems.length > 0) {
      const lastItem = saleItems[saleItems.length - 1];
      if(lastItem.productId !== lastAddedId) {
        setLastAddedId(lastItem.productId);
        const timer = setTimeout(() => setLastAddedId(null), 1000);
        return () => clearTimeout(timer);
      }
    } else {
        // When sale is cleared/completed, reset cash received
        setCashReceived('');
    }
  }, [saleItems, lastAddedId]);

  const handleCompleteSale = () => {
    completeAndResetSale();
  };

  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle>Venta Actual</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0">
        <ScrollArea className="flex-grow" style={{height: 'calc(100vh - 500px)'}}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleItems.length > 0 ? (
                saleItems.map(item => (
                  <TableRow key={item.productId} className={item.productId === lastAddedId ? 'animate-flash' : ''}>
                    <TableCell className="font-medium">
                      <div>{item.name}</div>
                      <div className="text-xs text-muted-foreground">${item.price.toFixed(2)} c/u</div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-semibold">${item.subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItemFromSale(item.productId)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-1">
                <label htmlFor='cash-received' className='text-sm font-medium'>Efectivo Recibido</label>
                <Input
                    id='cash-received'
                    type='number'
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className='text-lg'
                    placeholder='0.00'
                />
              </div>
              <div className="text-left sm:text-right space-y-1">
                <p className='text-sm font-medium'>Cambio:</p>
                <p className='text-xl font-bold'>${change > 0 ? change.toFixed(2) : '0.00'}</p>
              </div>
          </div>
          <Button
            onClick={handleCompleteSale}
            disabled={saleItems.length === 0}
            size='lg'
            className='w-full'
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Completar y Nueva Venta
          </Button>
        </CardFooter>
        )}
    </Card>
  );
}
