'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Product, SaleItem } from '@/lib/types';
import { initialProducts } from '@/lib/initial-products';
import { useToast } from "@/hooks/use-toast"


interface AppContextType {
  inventory: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  refreshInventory: () => void;
  saleItems: SaleItem[];
  addItemToSale: (product: Product, quantity: number) => void;
  removeItemFromSale: (productId: string) => void;
  updateSaleItemQuantity: (productId: string, quantity: number) => void;
  clearSale: () => void;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [inventory, setInventory] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      // Load inventory
      const storedInventory = window.localStorage.getItem('inventory');
      if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
      } else {
        setInventory(initialProducts);
        window.localStorage.setItem('inventory', JSON.stringify(initialProducts));
      }

      // Load current sale
      const storedSale = window.localStorage.getItem('currentSale');
      if (storedSale) {
        setSaleItems(JSON.parse(storedSale));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        variant: "destructive",
        title: "Error de carga",
        description: "No se pudieron cargar los datos. Usando valores por defecto.",
      })
      setInventory(initialProducts);
    } finally {
      setIsInitialized(true);
    }
  }, [toast]);

  const updateLocalStorage = useCallback((key: string, data: any) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to update ${key} in localStorage`, error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios.",
      })
    }
  }, [toast]);

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    setInventory(prevInventory => {
      const newProduct = { ...productData, id: new Date().toISOString() };
      const newInventory = [...prevInventory, newProduct];
      updateLocalStorage('inventory', newInventory);
      return newInventory;
    });
  }, [updateLocalStorage]);

  const refreshInventory = useCallback(() => {
     try {
      const storedInventory = window.localStorage.getItem('inventory');
      if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
      } else {
        setInventory(initialProducts);
      }
    } catch (error) {
      console.error("Failed to refresh inventory", error);
      toast({
        variant: "destructive",
        title: "Error de refresco",
        description: "No se pudo actualizar el inventario.",
      })
    }
  }, [toast])

  const addItemToSale = useCallback((product: Product, quantity: number) => {
    setSaleItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: item.price * (item.quantity + quantity) }
            : item
        );
      } else {
        newItems = [...prevItems, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          subtotal: product.price * quantity,
        }];
      }
      updateLocalStorage('currentSale', newItems);
      return newItems;
    });
  }, [updateLocalStorage]);

  const removeItemFromSale = useCallback((productId: string) => {
    setSaleItems(prevItems => {
      const newItems = prevItems.filter(item => item.productId !== productId);
      updateLocalStorage('currentSale', newItems);
      return newItems;
    });
  }, [updateLocalStorage]);

  const updateSaleItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromSale(productId);
      return;
    }
    setSaleItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      );
      updateLocalStorage('currentSale', newItems);
      return newItems;
    });
  }, [removeItemFromSale, updateLocalStorage]);

  const clearSale = useCallback(() => {
    setSaleItems([]);
    window.localStorage.removeItem('currentSale');
  }, []);

  const value = {
    inventory,
    addProduct,
    refreshInventory,
    saleItems,
    addItemToSale,
    removeItemFromSale,
    updateSaleItemQuantity,
    clearSale,
    isInitialized
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
