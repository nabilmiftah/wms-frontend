export interface WorkOrder {
  id: string;
  woNumber: string;
  type: "INBOUND" | "OUTBOUND";
  status: "TODO" | "ON_PROGRESS" | "DONE";
  quantity: number;
  remarks: string | null;
  warehouseId: string;
  storageBinId: string;
  assetId: string;
  createdAt: string;
  updatedAt: string;
  warehouse?: {
    id: string;
    whNumber: string;
    whName: string;
    whLocation: string | null;
  };
  storageBin?: {
    id: string;
    binAddress: string;
    category: string;
  };
  asset?: {
    id: string;
    assetNumber: string;
    assetName: string;
    category: string;
    price: string;
  };
  labels?: AssetLabel[];
  totalScanned?: number;
}

export interface AssetLabel {
  id: string;
  labelCode: string;
  inboundAt: string | null;
  isOutbound: boolean;
  outboundAt: string | null;
  workOrderId: string;
  assetId: string;
  createdAt: string;
}

export interface FifoLabel {
  id: string;
  labelCode: string;
  inboundAt: string;
  isOutbound: boolean;
  priority?: number;
}

export interface ScanRecord {
  id: string;
  labelCode: string;
  scannedAt: string;
  scannedBy: string;
  inboundAt?: string;
  inboundScan?: string;
}