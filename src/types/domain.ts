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

export const onboardingCompletionKinds = ['completed', 'skipped'] as const;

export type OnboardingCompletionKind = (typeof onboardingCompletionKinds)[number];

export type OnboardingStatus = {
  id: string;
  userId: string;
  completedAt?: string;
  skippedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingCompletionInput = {
  kind: OnboardingCompletionKind;
};

export type OnboardingDataSource = 'supabase' | 'preview';

export type ExchangeRateSnapshot = {
  id: string;
  baseCurrency: 'USD';
  quoteCurrency: 'KRW';
  rate: number;
  previousRate?: number;
  fetchedAt: string;
  expiresAt?: string;
  sourceLabel: string;
};

export type ExchangeRateDataSource = 'supabase' | 'preview';

export type FxVolatilityDirection = 'up' | 'down' | 'stable';

export type SubscriptionFxEstimate = {
  subscriptionId: string;
  currency: 'USD';
  originalAmount: number;
  exchangeRate: number;
  estimatedKrwAmount: number;
  estimateLowKrwAmount: number;
  estimateHighKrwAmount: number;
  normalizedMonthlyKrwAmount: number;
  volatilityDirection: FxVolatilityDirection;
  volatilityDelta: number;
  fetchedAt: string;
  sourceLabel: string;
};

export const notificationLeadDays = [1, 3, 7] as const;

export type NotificationLeadDays = (typeof notificationLeadDays)[number];

export type NotificationSettings = {
  id: string;
  userId: string;
  billingRemindersEnabled: boolean;
  trialEndingRemindersEnabled: boolean;
  fxVolatilityAlertsEnabled: boolean;
  marketingUpdatesEnabled: boolean;
  reminderLeadDays: NotificationLeadDays;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSettingsWriteInput = Omit<
  NotificationSettings,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type NotificationSettingsDataSource = 'supabase' | 'preview';

export const notificationScheduleKinds = [
  'billing_reminder',
  'trial_ending_reminder',
  'fx_billing_watch',
] as const;

export type NotificationScheduleKind = (typeof notificationScheduleKinds)[number];

export type NotificationScheduleItem = {
  id: string;
  kind: NotificationScheduleKind;
  subscriptionId?: string;
  serviceName?: string;
  title: string;
  description: string;
  scheduledFor: string;
  sourceDate: string;
  requiresPremium: boolean;
};

export const premiumTransactionStatuses = ['active', 'expired', 'canceled'] as const;

export type PremiumTransactionStatus = (typeof premiumTransactionStatuses)[number];

export const premiumBillingCycles = ['monthly', 'yearly'] as const;

export type PremiumBillingCycle = (typeof premiumBillingCycles)[number];

export type PremiumTransaction = {
  id: string;
  userId: string;
  planId: string;
  status: PremiumTransactionStatus;
  billingCycle: PremiumBillingCycle;
  priceUsd: number;
  purchasedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PremiumCheckoutInput = Pick<PremiumTransaction, 'planId' | 'billingCycle' | 'priceUsd'>;

export type PremiumDataSource = 'supabase' | 'preview';

export type PlanAvailability = 'available' | 'coming_soon';

export type PremiumPlan = {
  id: string;
  name: string;
  priceLabel: string;
  billingCycle: PremiumBillingCycle;
  description: string;
  badge?: string;
  availability: PlanAvailability;
  features: string[];
  priceUsd: number;
};
