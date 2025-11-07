'use client';
import { useAppContext } from '@/contexts/app-context';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function DeleteProductDialog({ product, isOpen, onOpenChange }: DeleteProductDialogProps) {
  const { deleteProduct } = useAppContext();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!product) return;
    deleteProduct(product.id);
    toast({
        variant: "destructive",
        title: "Producto eliminado",
        description: `"${product.name}" ha sido eliminado del inventario.`,
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el producto 
            <span className="font-semibold">"{product?.name}"</span> de tu inventario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
