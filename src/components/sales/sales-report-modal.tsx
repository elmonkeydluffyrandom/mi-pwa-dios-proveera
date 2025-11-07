'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/constants';
import { CompletedSale } from '@/lib/types';

interface SalesReportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type SalesByCategory = {
    [category: string]: {
        total: number;
        quantity: number;
    }
}

function processSalesData(completedSales: CompletedSale[]) {
    const data: SalesByCategory = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: { total: 0, quantity: 0 } }), {});

    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        if (data[item.category]) {
          data[item.category].total += item.subtotal;
          data[item.category].quantity += item.quantity;
        } else {
            // Handle uncategorized items if necessary
            if(!data['Otros']) data['Otros'] = { total: 0, quantity: 0 };
            data['Otros'].total += item.subtotal;
            data['Otros'].quantity += item.quantity;
        }
      });
    });

    const totalSales = Object.values(data).reduce((sum, cat) => sum + cat.total, 0);
    const sortedCategories = Object.entries(data)
                                    .filter(([, {total}]) => total > 0)
                                    .sort(([, a], [, b]) => b.total - a.total);


    return { data, totalSales, sortedCategories };
}


export function SalesReportModal({ isOpen, onOpenChange }: SalesReportModalProps) {
  const { completedSales } = useAppContext();

  const reportData = useMemo(() => processSalesData(completedSales), [completedSales]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reporte de Ventas por Categoría</DialogTitle>
          <DialogDescription>
            Resumen de las ventas totales agrupadas por cada categoría de producto.
          </DialogDescription>
        </DialogHeader>
        
        {completedSales.length > 0 ? (
          <div className='space-y-4'>
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl text-right">
                        Venta Total: ${reportData.totalSales.toFixed(2)}
                    </CardTitle>
                </CardHeader>
            </Card>
            <ScrollArea className="h-[60vh]">
            <Table>
                <TableHeader className='sticky top-0 bg-card'>
                <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Artículos Vendidos</TableHead>
                    <TableHead className="text-right">Total de Ventas</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {reportData.sortedCategories.map(([category, { total, quantity }]) => (
                    <TableRow key={category}>
                    <TableCell className="font-medium">
                        <Badge variant="secondary">{category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{quantity}</TableCell>
                    <TableCell className="text-right">${total.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </ScrollArea>
          </div>
        ) : (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No hay ventas completadas para mostrar.</p>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
