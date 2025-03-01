
export interface Item {
  id: string;
  image: string;
  stockCode: string;
  productName: string;
  boxes: number;
  unitsPerBox: number;
  initialPrice: number;
  sellingPrice: number;
  location: string;
  stockStatus: string;
  unitsLeft: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  items_count: number;
}

// Define the shape of what Supabase returns for items
export interface ItemResponse {
  id: string;
  image: string | null;
  sku: string;
  name: string;
  boxes: number;
  units_per_box: number;
  bought_price: number;
  shipment_fees: number;
  selling_price: number;
  quantity: number;
  warehouse_id: string | null;
  warehouses: {  // This is returned as a single object, not an array
    name: string;
    location: string;
  } | null;
}

export interface NewItem {
  image: string;
  stockCode: string;
  productName: string;
  boxes: number;
  unitsPerBox: number;
  boughtPrice: number;
  shipmentFees: number;
  sellingPrice: number;
  warehouse: string;
  lowStockThreshold: number;
}

export interface EditingItem extends NewItem {
  id: string;
}

export interface FormErrors {
  stockCode: boolean;
  productName: boolean;
  warehouse: boolean;
}
