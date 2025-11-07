'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/constants';

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

export function SalesReportModal({ isOpen, onOpenChange }: SalesReportModalProps) {
  const { completedSales } = useAppContext();

  const reportData = useMemo(() => {
    const data: SalesByCategory = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: { total: 0, quantity: 0 } }), {});

    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        if (data[item.category]) {
          data[item.category].total += item.subtotal;
          data[item.category].quantity += item.quantity;
        }
      });
    });

    const totalSales = Object.values(data).reduce((sum, cat) => sum + cat.total, 0);

    return { data, totalSales };
  }, [completedSales]);

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
                {Object.entries(reportData.data).map(([category, { total, quantity }]) => (
                    total > 0 && (
                        <TableRow key={category}>
                        <TableCell className="font-medium">
                            <Badge variant="secondary">{category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{quantity}</TableCell>
                        <TableCell className="text-right">${total.toFixed(2)}</TableCell>
                        </TableRow>
                    )
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
