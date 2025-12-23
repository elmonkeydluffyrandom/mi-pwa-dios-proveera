'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Product, SaleItem, CompletedSale } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { useFirestore } from '@/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
  getDocs,
  type Firestore
} from 'firebase/firestore';

interface AppContextType {
  inventory: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saleItems: SaleItem[];
  addItemToSale: (product: Product, quantity: number) => void;
  removeItemFromSale: (productId: string) => void;
  updateSaleItemQuantity: (productId: string, quantity: number) => void;
  clearSale: () => void;
  completeAndResetSale: () => Promise<void>;
  completedSales: CompletedSale[];
  clearCompletedSales: () => Promise<void>;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function useFirestoreSubscription<T>(
    firestore: Firestore | undefined,
    collectionName: string,
    callback: (data: T[]) => void,
    orderField: string,
    orderDirection: 'asc' | 'desc' = 'asc'
) {
    const { toast } = useToast();

    useEffect(() => {
        if (!firestore) return;

        const collectionRef = collection(firestore, collectionName);
        const q = query(collectionRef, orderBy(orderField, orderDirection));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const docData = doc.data();
                // Manejo especial para fechas de Firebase
                if (docData.date && typeof docData.date.toDate === 'function') {
                    return {
                        id: doc.id,
                        ...docData,
                        date: docData.date.toDate().toISOString(),
                    } as T;
                }
                return { id: doc.id, ...docData } as T;
            });
            callback(data);
        }, (error) => {
            console.error(`Failed to fetch ${collectionName} from Firestore`, error);
            // Evitamos spam de toasts si falla la conexión constante
        });

        return () => unsubscribe();
    }, [firestore, collectionName, callback, orderField, orderDirection, toast]);
}


export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const firestore = useFirestore();
  const [inventory, setInventory] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [completedSales, setCompletedSales] = useState<CompletedSale[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleInventoryUpdate = useCallback((data: Product[]) => {
      setInventory(data);
      if(!isInitialized) setIsInitialized(true);
  },[isInitialized]);

  const handleSalesUpdate = useCallback((data: CompletedSale[]) => {
      setCompletedSales(data);
  },[]);
  
  useFirestoreSubscription<Product>(firestore, 'inventory', handleInventoryUpdate, 'name');
  useFirestoreSubscription<CompletedSale>(firestore, 'completedSales', handleSalesUpdate, 'date', 'desc');

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    if (!firestore) return;
    try {
      const inventoryRef = collection(firestore, 'inventory');
      await addDoc(inventoryRef, productData);
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo agregar el producto.",
        });
    }
  }, [firestore, toast]);

   const updateProduct = useCallback(async (updatedProduct: Product) => {
    if (!firestore) return;
    const { id, ...productData } = updatedProduct;
    const productRef = doc(firestore, 'inventory', id);
    try {
      await updateDoc(productRef, productData);
      // Actualización optimista local
      setSaleItems(prevItems => {
          const newItems = prevItems.map(item =>
              item.productId === id
              ? { ...item, name: updatedProduct.name, price: updatedProduct.price, category: updatedProduct.category, subtotal: updatedProduct.price * item.quantity }
              : item
          );
          return newItems;
      });
    } catch (error) {
        console.error("Error updating document: ", error);
         toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo actualizar el producto.",
        });
    }
  }, [firestore, toast]);

  const deleteProduct = useCallback(async (productId: string) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'inventory', productId);
    try {
        await deleteDoc(productRef);
        setSaleItems(prevItems => prevItems.filter(item => item.productId !== productId));
    } catch (error) {
         console.error("Error deleting document: ", error);
         toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo eliminar el producto.",
        });
    }
  }, [firestore, toast]);


  const addItemToSale = useCallback((product: Product, quantity: number) => {
    setSaleItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: item.price * (item.quantity + quantity) }
            : item
        );
      } else {
        return [...prevItems, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          subtotal: product.price * quantity,
          category: product.category,
        }];
      }
    });
  }, []);

  const removeItemFromSale = useCallback((productId: string) => {
    setSaleItems(prevItems => prevItems.filter(item => item.productId !== productId));
  }, []);

  const updateSaleItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromSale(productId);
      return;
    }
    setSaleItems(prevItems => {
      return prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      );
    });
  }, [removeItemFromSale]);

  const clearSale = useCallback(() => {
    setSaleItems([]);
  }, []);

  // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
  const completeAndResetSale = useCallback(async () => {
    if (saleItems.length === 0) return;
    
    // 1. Guardamos los datos en variables locales antes de borrar
    const itemsToSave = [...saleItems];
    const totalToSave = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    const newSale = {
        date: serverTimestamp(),
        items: itemsToSave,
        total: totalToSave,
    };

    // 2. ¡LIMPIEZA INMEDIATA! 
    // Ejecutamos esto PRIMERO para que la UI responda al instante
    clearSale(); 
    
    toast({
        title: "Venta Registrada",
        description: `Total: $${totalToSave.toFixed(2)}`,
        duration: 2000,
    });

    // 3. Enviamos a Firebase DESPUÉS y sin bloquear la UI
    if (firestore) {
        addDoc(collection(firestore, 'completedSales'), newSale)
            .catch((error) => {
                console.error("Error guardando en background: ", error);
                // No mostramos error al usuario porque en offline es normal que quede pendiente
            });
    }

  }, [saleItems, clearSale, firestore, toast]);

    const clearCompletedSales = useCallback(async () => {
        if (!firestore) return;
        const salesRef = collection(firestore, 'completedSales');
        try {
            const querySnapshot = await getDocs(salesRef);
            const batch = writeBatch(firestore);
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            toast({
                title: "Reporte Reiniciado",
                description: "Historial borrado correctamente."
            });
        } catch (error) {
            console.error("Error clearing completed sales: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo reiniciar el reporte."
            });
        }
    }, [firestore, toast]);


  const value = {
    inventory,
    addProduct,
    updateProduct,
    deleteProduct,
    saleItems,
    addItemToSale,
    removeItemFromSale,
    updateSaleItemQuantity,
    clearSale,
    completeAndResetSale,
    completedSales,
    clearCompletedSales,
    isInitialized: firestore ? isInitialized : false,
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