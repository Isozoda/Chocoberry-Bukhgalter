export type InsightType = 'positive' | 'negative' | 'warning';
export type PriorityType = 'high' | 'medium' | 'low';
export type UrgencyType = 'critical' | 'warning' | 'ok';

export interface SalesInsight {
  type: InsightType;
  text: string;
}

export interface SalesRecommendation {
  priority: PriorityType;
  action: string;
  reason: string;
}

export interface SalesForecast {
  nextPeriodRevenue: number;
  confidence: number;
}

export interface SalesAnalysisResult {
  summary: string;
  insights: SalesInsight[];
  recommendations: SalesRecommendation[];
  forecast: SalesForecast;
  rawData: {
    period: string;
    totalSales: string;
    totalExpenses: string;
    netProfit: string;
    salesCount: number;
  };
}

export interface CriticalInventoryItem {
  name: string;
  currentStock: string;
  willRunOutIn: string;
  orderNow: number;
  unit: string;
  urgency: UrgencyType;
}

export interface OrderItem {
  name: string;
  amount: number;
  unit: string;
  estimatedCost: number;
  urgency: UrgencyType;
}

export interface InventoryForecastResult {
  criticalItems: CriticalInventoryItem[];
  orderList: OrderItem[];
  totalOrderCost: number;
  notes: string;
  rawData: {
    currentStock: Array<{
      name: string;
      currentStock: string;
      unit: string;
      daysRemaining: number | null;
    }>;
  };
}

export interface ProductAdvice {
  action: string;
  product: string;
  reason: string;
}

export interface CostAdvice {
  advice: string;
  potentialSaving: string;
}

export interface AdvisorResult {
  weeklyAdvice: string;
  productAdvice: ProductAdvice[];
  costAdvice: CostAdvice[];
  opportunityAdvice: string;
  answerToQuestion: string | null;
  rawData: {
    monthlySales: string;
    netProfit: string;
  };
}

export type SalesPeriod = 'day' | 'week' | 'month';
export type ForecastDays = 7 | 14 | 30;
