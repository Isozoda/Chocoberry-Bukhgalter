import axios, { AxiosInstance } from 'axios';

export class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string, botSecret: string) {
    this.client = axios.create({
      baseURL,
      headers: { 'x-bot-secret': botSecret, 'Content-Type': 'application/json' },
      timeout: 10_000,
    });
  }

  async subscribe(token: string, chatId: string): Promise<{ ok: boolean }> {
    const res = await this.client.post('/telegram/subscribe', { token, chatId: chatId.toString() });
    return res.data?.data ?? res.data;
  }

  async getStatus(businessId: string): Promise<{ items: InventoryItem[] }> {
    const res = await this.client.get(`/inventory?businessId=${businessId}`);
    return res.data?.data ?? res.data;
  }

  async getDailyReport(businessId: string): Promise<DailyReportSummary | null> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await this.client.get(`/daily-report?date=${today}&businessId=${businessId}`);
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  }

  async getLowStockItems(chatId: string): Promise<InventoryItem[]> {
    try {
      const res = await this.client.get(`/telegram/inventory/status?chatId=${chatId}`);
      const items = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      return items;
    } catch (error) {
      const err = error as any;
      console.error('API Error (getLowStockItems):', err.response?.data || err.message);
      return [];
    }
  }

  async getInventoryItems(chatId: string): Promise<{ businessId: string; items: InventoryItemRef[] }> {
    const res = await this.client.get(`/telegram/inventory/items?chatId=${encodeURIComponent(chatId)}`);
    return res.data?.data ?? res.data;
  }

  async bulkDeduct(
    chatId: string,
    items: Array<{ itemId: string; quantity: number; unit: string }>,
    rawMessage?: string,
  ): Promise<BulkDeductResult> {
    const res = await this.client.post('/telegram/bulk-deduct', { chatId, items, rawMessage });
    return res.data?.data ?? res.data;
  }

  async parseDailyReport(rawText: string): Promise<ParsedDailyReportResult> {
    const res = await this.client.post('/telegram/daily-report/parse', { rawText });
    return res.data?.data ?? res.data;
  }

  async saveDailyReport(payload: {
    chatId: string;
    date: string;
    openingBalance: number;
    closingBalance: number;
    totalExpenses: number;
    rawText: string;
    items: Array<{ name: string; amount: number; category: string }>;
  }): Promise<{ ok: boolean; id: string }> {
    const res = await this.client.post('/telegram/daily-report/save', payload);
    return res.data?.data ?? res.data;
  }
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: string;
  minStockLevel: string;
  unit: string;
}

export interface InventoryItemRef {
  id: string;
  name: string;
  nameRu?: string | null;
  nameTg?: string | null;
  unit: string;
  currentStock: string;
  minStockLevel: string;
}

export interface BulkDeductResult {
  results: Array<{
    id: string;
    name: string;
    unit: string;
    stockBefore: string;
    stockAfter: string;
    quantity: string;
    isLow: boolean;
    minStockLevel: string;
  }>;
  warnings: Array<{ itemId: string; error: string }>;
}

export interface DailyReportSummary {
  date: string;
  totalSales: number;
  totalExpenses: number;
  remaining: number;
}

export interface ParsedDailyReportResult {
  date: string | null;
  openingBalance: number;
  closingBalance: number;
  totalExpenses: number;
  items: Array<{ name: string; amount: number; category: string }>;
}
