export const subscriptionStatuses = ['trial', 'active', 'past_due', 'canceled'] as const;

export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const subscriptionCategories = [
  'OTT',
  'Music',
  'Shopping',
  'Productivity',
  'Cloud',
  'Education',
  'AI',
  'Gaming',
  'Others',
] as const;

export type SubscriptionCategory = (typeof subscriptionCategories)[number];

export const supportedCurrencies = ['KRW', 'USD'] as const;

export type SupportedCurrency = (typeof supportedCurrencies)[number];

export const subscriptionBillingCycles = ['monthly', 'yearly'] as const;

export type SubscriptionBillingCycle = (typeof subscriptionBillingCycles)[number];

export const paymentMethodTypes = ['app_store', 'play_store', 'card', 'paypal', 'other'] as const;

export type PaymentMethodType = (typeof paymentMethodTypes)[number];

export const usageFrequencies = ['high', 'medium', 'low'] as const;

export type UsageFrequency = (typeof usageFrequencies)[number];

export type Subscription = {
  id: string;
  userId: string;
  serviceName: string;
  category: SubscriptionCategory;
  billingCycle: SubscriptionBillingCycle;
  amount: number;
  currency: SupportedCurrency;
  paymentMethodType: PaymentMethodType;
  nextBillingDate: string;
  isTrial: boolean;
  trialEndDate?: string;
  usageFrequency: UsageFrequency;
  note?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionWriteInput = Omit<
  Subscription,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type SubscriptionDataSource = 'supabase' | 'preview';

export const budgetHealthStatuses = ['healthy', 'caution', 'warning'] as const;

export type BudgetHealthStatus = (typeof budgetHealthStatuses)[number];

export type UserFinancialProfile = {
  id: string;
  userId: string;
  monthlyNetSalary: number;
  monthlyFixedCosts: number;
  createdAt: string;
  updatedAt: string;
};

export type UserFinancialProfileWriteInput = Omit<
  UserFinancialProfile,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type BudgetReport = {
  monthlyNetSalary: number;
  monthlyFixedCosts: number;
  monthlySubscriptionTotal: number;
  monthlyCommittedCosts: number;
  disposableIncome: number;
  recommendedSavingsTarget: number;
  recommendedLivingBudget: number;
  recommendedSubscriptionBudgetMin: number;
  recommendedSubscriptionBudgetMax: number;
  fixedCostRatio: number;
  subscriptionRatio: number;
  fixedCostStatus: BudgetHealthStatus;
  subscriptionStatus: BudgetHealthStatus;
  foreignCurrencySubscriptionCount: number;
  guidance: string[];
};

export type MoneyPlanDataSource = 'supabase' | 'preview';

export type PlanAvailability = 'available' | 'coming_soon';

export type BillingCycle = 'monthly' | 'annual';

export type Plan = {
  id: string;
  name: string;
  priceLabel: string;
  billingCycle: BillingCycle;
  description: string;
  seatLabel: string;
  availability: PlanAvailability;
  features: string[];
};
