export interface Asset {
  id: string;

  assetNumber: string;

  assetName: string;

  category: string;

  price: string;

  quantity: number;

  remarks?: string | null;

  supplierId?: string | null;

  storageBinId?: string | null;

  isActive?: boolean;

  supplier?: {
    id: string;

    supName: string;
  } | null;
}