export interface CreateInventoryItemDto {
    name: string;
    description?: string | null;
    lowStockThreshold: number;
}

export interface InventoryItemResponseDto {
    id: number;
    name: string;
    description?: string | null;
    quantity: number;
    lowStockThreshold: number;
    isLowStock: boolean;
}

export interface StockOperationDto {
    itemId: number;
    quantity: number;
    notes?: string | null;
}

export interface StockTransactionDto {
    id: number;
    itemId: number;
    itemName: string;
    transactionType: string;
    quantity: number;
    transactionDate: string; // ISO 8601 string from backend
}

export interface DashboardSummaryDto {
    totalItems: number;
    lowStockCount: number;
    recentTransactions: StockTransactionDto[];
}
