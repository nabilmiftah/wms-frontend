export interface StorageBin {
  id: string;
  binAddress: string;
  category: "SMALL_ASSET" | "MEDIUM_ASSET" | "LARGE_ASSET";
  remarks: string | null;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
  warehouse: {
    id: string;
    whNumber: string;
    whName: string;
    whLocation: string | null;
    remarks: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  asset: {
    id: string;
    assetNumber: string;
    assetName: string;
    category: string;
    price: string;
    quantity: number;
    remarks: string | null;
    supplierId: string | null;
    storageBinId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
}