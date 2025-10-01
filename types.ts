import { Transaction as PrismaTransaction } from "@prisma/client";
import { Product as PrismaProduct } from "@prisma/client";

export interface FormDataType {
  id?: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  categoryId: string;
  unit?: string;
  categoryName?: string;
  imageUrl?: string;
}

export interface Product extends PrismaProduct {
  categoryName: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unit: string;
  imageUrl: string;
  name: string;
  availableQuantity: number;
}

export interface Transaction extends PrismaTransaction {
  categoryName: string;
  productName: string;
  imageUrl: string;
  price: number;
  unit: string;
}

export interface ProductOverviewStat {
  totalProducts: number;
  totalCategories: number;
  totalTransaction: number;
  stockValue: number;
}

export interface ChartData {
  value: number;
  name: string;
}

export interface StockSummary {
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  criticalProducts: Product[];
}
