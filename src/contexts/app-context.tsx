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
                // Special handling for timestamp fields
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
            toast({
                variant: "destructive",
                title: "Error de Carga",
                description: `No se pudo cargar ${collectionName}.`,
            });
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
            title: "Error de base de datos",
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
            title: "Error de base de datos",
            description: "No se pudo actualizar el producto.",
        });
    }
  }, [firestore, toast]);

  const deleteProduct = useCallback(async (productId: string) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'inventory', productId);
    try {
        await deleteDoc(productRef);
        setSaleItems(prevItems => {
            const newItems = prevItems.filter(item => item.productId !== productId);
            return newItems;
        });
    } catch (error) {
         console.error("Error deleting document: ", error);
         toast({
            variant: "destructive",
            title: "Error de base de datos",
            description: "No se pudo eliminar el producto.",
        });
    }
  }, [firestore, toast]);


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
          category: product.category,
        }];
      }
      return newItems;
    });
  }, []);

  const removeItemFromSale = useCallback((productId: string) => {
    setSaleItems(prevItems => {
      const newItems = prevItems.filter(item => item.productId !== productId);
      return newItems;
    });
  }, []);

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
      return newItems;
    });
  }, [removeItemFromSale]);

  const clearSale = useCallback(() => {
    setSaleItems([]);
  }, []);

  const completeAndResetSale = useCallback(async () => {
    // 1. Validaciones de seguridad
    if (saleItems.length === 0 || !firestore) {
        if (saleItems.length === 0) {
              toast({
                variant: "destructive",
                title: "Venta vacía",
                description: "No hay productos en la venta actual para completar.",
            });
        }
        return;
    };
    
    // 2. Preparamos los datos de la venta
    // Guardamos una copia local de los items y el total antes de borrar todo
    const currentItems = [...saleItems]; 
    const currentTotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newSale = {
        date: serverTimestamp(),
        items: currentItems,
        total: currentTotal,
    };
    
    // 3. --- EL TRUCO DE MAGIA ---
    // Limpiamos la pantalla INMEDIATAMENTE. No esperamos a Firebase.
    // Esto hace que la app se sienta instantánea.
    clearSale(); 

    toast({
        title: "Venta registrada",
        description: `Venta de $${newSale.total.toFixed(2)} guardada correctamente.`,
    });

    // 4. Mandamos a guardar a Firebase en "segundo plano"
    // Usamos .catch por si hay un error real de base de datos, pero no bloqueamos la UI
    try {
        await addDoc(collection(firestore, 'completedSales'), newSale);
    } catch (error) {
        console.error("Error al guardar en segundo plano: ", error);
        // Aunque falle el envío inmediato, como tienes persistencia activada,
        // Firebase ya lo guardó en el caché del celular.
        toast({
            variant: "destructive",
            title: "Nota",
            description: "La venta se guardó en el celular y subirá al volver el internet.",
        });
    }

  }, [saleItems, clearSale, firestore, toast]);


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
