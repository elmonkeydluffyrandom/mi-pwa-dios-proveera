'use client';
import { useState } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import { suggestNewProducts } from '@/ai/flows/suggest-new-products';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';

interface ProductSuggesterModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ProductSuggesterModal({ isOpen, onOpenChange }: ProductSuggesterModalProps) {
  const { inventory } = useAppContext();
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestProducts = async () => {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const inventoryList = inventory.map(p => `- ${p.name} (Categoría: ${p.category})`).join('\n');
      const result = await suggestNewProducts({
        currentInventory: inventoryList,
        salesData: 'No hay datos de ventas recientes disponibles. Basar sugerencias en el inventario actual y productos populares relacionados.',
      });
      setSuggestions(result.suggestedProducts);
    } catch (error) {
      console.error('Failed to get product suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Error de IA',
        description: 'No se pudieron generar las sugerencias. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" />
            Sugerencias de Productos con IA
          </DialogTitle>
          <DialogDescription>
            Obtén recomendaciones de nuevos productos para tu tienda basadas en tu inventario actual.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Button onClick={handleSuggestProducts} disabled={isLoading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? 'Generando...' : 'Generar Sugerencias'}
          </Button>

          {isLoading && (
            <div className="space-y-2 pt-4">
                <div className="w-full h-8 bg-muted rounded animate-pulse"></div>
                <div className="w-3/4 h-8 bg-muted rounded animate-pulse"></div>
                <div className="w-full h-8 bg-muted rounded animate-pulse"></div>
            </div>
          )}

          {suggestions && (
            <Card className="mt-4 bg-secondary/50">
                 <CardContent className="p-4">
                    <ScrollArea className="h-64">
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: suggestions.replace(/Product:/g, '<strong>Producto:</strong>').replace(/Reason:/g, '<em>Razón:</em>') }}
                    />
                    </ScrollArea>
                 </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
