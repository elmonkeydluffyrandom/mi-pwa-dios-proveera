'use client';
import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useAppContext } from '@/contexts/app-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, Pencil, Trash2, Download } from 'lucide-react';
import { Product } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditProductModal } from './edit-product-modal';
import { DeleteProductDialog } from './delete-product-dialog';
import { CATEGORIES } from '@/lib/constants';

interface InventoryModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function InventoryModal({ isOpen, onOpenChange }: InventoryModalProps) {
  const { inventory } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const groupedAndFilteredInventory = useMemo(() => {
    const filtered = inventory.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (searchTerm) {
        return [{ category: 'Resultados de la búsqueda', products: filtered.sort((a,b) => a.name.localeCompare(b.name)) }];
    }

    const grouped = CATEGORIES.reduce((acc, category) => {
        const productsInCategory = filtered
            .filter(p => p.category === category)
            .sort((a,b) => a.name.localeCompare(b.name));
        
        if (productsInCategory.length > 0) {
            acc.push({ category, products: productsInCategory });
        }
        return acc;
    }, [] as { category: string; products: Product[] }[]);

    return grouped;

  }, [inventory, searchTerm]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  }

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  }

    const exportToPDF = () => {
    const doc = new jsPDF();
    const today = format(new Date(), 'dd/MM/yyyy');
    
    doc.setFontSize(20);
    doc.text('Inventario - Dios Proveerá', 14, 22);
    doc.setFontSize(12);
    doc.text(`Fecha: ${today}`, 14, 30);
    
    const tableData = inventory.map(product => [
      product.name,
      product.category,
      `$${product.price.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Producto', 'Categoría', 'Precio']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [36, 56, 99] },
    });

    doc.save(`inventario-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };


  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-full">
        <DialogHeader>
          <DialogTitle>Inventario de Productos</DialogTitle>
          <DialogDescription>
            Aquí puedes ver, editar y eliminar los productos disponibles en la tienda.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
             <Button onClick={exportToPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar a PDF
            </Button>
        </div>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader className='sticky top-0 bg-card z-10'>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className='hidden md:table-cell'>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="w-16 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedAndFilteredInventory.length > 0 ? (
                groupedAndFilteredInventory.map(({ category, products }) => (
                  <React.Fragment key={category}>
                    {!searchTerm && (
                        <TableRow className="bg-secondary hover:bg-secondary/80">
                            <TableCell colSpan={4} className="font-bold text-secondary-foreground">
                                {category}
                            </TableCell>
                        </TableRow>
                    )}
                    {products.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className='hidden md:table-cell'>{product.category}</TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleEdit(product)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No se encontraron productos o el inventario está vacío.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    
    <EditProductModal 
        product={editingProduct} 
        isOpen={!!editingProduct} 
        onOpenChange={(open) => !open && setEditingProduct(null)} 
    />
    
    <DeleteProductDialog
        product={deletingProduct}
        isOpen={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
    />
    </>
  );
}
