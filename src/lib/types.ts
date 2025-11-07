export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface SaleItem {
  productId: string;
  name:string;
  price: number;
  quantity: number;
  subtotal: number;
  category: string;
}

export interface CompletedSale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
}
