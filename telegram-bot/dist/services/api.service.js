"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiService {
    constructor(baseURL, botSecret) {
        this.client = axios_1.default.create({
            baseURL,
            headers: { 'x-bot-secret': botSecret, 'Content-Type': 'application/json' },
            timeout: 10000,
        });
    }
    async subscribe(token, chatId) {
        const res = await this.client.post('/telegram/subscribe', { token, chatId: chatId.toString() });
        return res.data?.data ?? res.data;
    }
    async getStatus(businessId) {
        const res = await this.client.get(`/inventory?businessId=${businessId}`);
        return res.data?.data ?? res.data;
    }
    async getDailyReport(businessId) {
        const today = new Date().toISOString().split('T')[0];
        try {
            const res = await this.client.get(`/daily-report?date=${today}&businessId=${businessId}`);
            return res.data?.data ?? null;
        }
        catch {
            return null;
        }
    }
    async getLowStockItems(chatId) {
        try {
            const res = await this.client.get(`/telegram/inventory/status?chatId=${chatId}`);
            const items = res.data?.data || (Array.isArray(res.data) ? res.data : []);
            return items;
        }
        catch (error) {
            const err = error;
            console.error('API Error (getLowStockItems):', err.response?.data || err.message);
            return [];
        }
    }
    async getInventoryItems(chatId) {
        const res = await this.client.get(`/telegram/inventory/items?chatId=${encodeURIComponent(chatId)}`);
        return res.data?.data ?? res.data;
    }
    async bulkDeduct(chatId, items, rawMessage) {
        const res = await this.client.post('/telegram/bulk-deduct', { chatId, items, rawMessage });
        return res.data?.data ?? res.data;
    }
}
exports.ApiService = ApiService;
