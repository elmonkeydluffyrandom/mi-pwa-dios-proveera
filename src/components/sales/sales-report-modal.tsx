'use client';
import { useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useAppContext } from '@/contexts/app-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import type { CompletedSale, SaleItem } from '@/lib/types';

interface SalesReportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type AggregatedItem = {
    name: string;
    quantity: number;
    subtotal: number;
}

type SalesByCategory = {
    [category: string]: {
        total: number;
        quantity: number;
        items: { [productId: string]: AggregatedItem };
    }
}

function processSalesData(completedSales: CompletedSale[]) {
    const data: SalesByCategory = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: { total: 0, quantity: 0, items: {} } }), {});

    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const category = item.category || 'Otros';
        if (!data[category]) {
          data[category] = { total: 0, quantity: 0, items: {} };
        }
        
        data[category].total += item.subtotal;
        data[category].quantity += item.quantity;
        
        if (data[category].items[item.productId]) {
            data[category].items[item.productId].quantity += item.quantity;
            data[category].items[item.productId].subtotal += item.subtotal;
        } else {
            data[category].items[item.productId] = {
                name: item.name,
                quantity: item.quantity,
                subtotal: item.subtotal
            };
        }
      });
    });

    const totalSales = Object.values(data).reduce((sum, cat) => sum + cat.total, 0);
    
    const sortedCategories = Object.entries(data)
        .filter(([, {total}]) => total > 0)
        .sort(([, a], [, b]) => b.total - a.total)
        .map(([category, details]) => ({
            category,
            ...details,
            items: Object.values(details.items).sort((a,b) => b.quantity - a.quantity)
        }));

    return { totalSales, sortedCategories };
}


export function SalesReportModal({ isOpen, onOpenChange }: SalesReportModalProps) {
  const { completedSales } = useAppContext();
  const reportData = useMemo(() => processSalesData(completedSales), [completedSales]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const today = format(new Date(), 'dd/MM/yyyy');
    
    doc.setFontSize(20);
    doc.text('Tienda "Dios Proveerá"', 14, 22);
    doc.setFontSize(12);
    doc.text(`Reporte de Ventas - ${today}`, 14, 30);
    doc.setFontSize(14);
    doc.text(`Venta Total: $${reportData.totalSales.toFixed(2)}`, 14, 40);

    const tableData = reportData.sortedCategories.flatMap(categoryData => {
        const categoryRow = [
            { content: categoryData.category, styles: { fontStyle: 'bold' } },
            { content: categoryData.quantity, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: `$${categoryData.total.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } },
        ];
        const itemRows = categoryData.items.map(item => [
            `  - ${item.name}`,
            item.quantity,
            `$${item.subtotal.toFixed(2)}`
        ]);
        return [categoryRow, ...itemRows, [{ content: '', colSpan: 3 }]]; // Add a spacer row
    });

    autoTable(doc, {
        startY: 50,
        head: [['Categoría / Producto', 'Artículos Vendidos', 'Total de Ventas']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [36, 56, 99] }, // Primary color
        didDrawCell: (data) => {
            if (data.row.raw && Array.isArray(data.row.raw) && (data.row.raw[0] as any).styles?.fontStyle === 'bold') {
                if (data.cell.styles.fillColor) {
                  doc.setFillColor(241, 245, 249); // Secondary color
                }
            }
        }
    });

    doc.save(`reporte-ventas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reporte de Ventas</DialogTitle>
          <DialogDescription>
            Resumen de ventas por categoría con desglose de productos.
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
            <ScrollArea className="h-[55vh]">
              <Accordion type="multiple" className="w-full">
                {reportData.sortedCategories.map(({ category, total, quantity, items }) => (
                  <AccordionItem value={category} key={category}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full pr-4">
                        <span className="font-bold">{category}</span>
                        <div className="flex gap-8 text-right">
                           <span>{quantity} artículos</span>
                           <span className="font-semibold">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='pl-8'>Producto</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map(item => (
                            <TableRow key={item.name}>
                              <TableCell className="pl-8">{item.name}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
             <DialogFooter>
                <Button onClick={exportToPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a PDF
                </Button>
            </DialogFooter>
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
