import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { TextInputField } from '@/components/ui/text-input-field';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  createSubscriptionFormDefaults,
  mapFormValuesToSubscriptionInput,
  subscriptionFormSchema,
  type SubscriptionFormValues,
} from '@/features/subscriptions/schemas/subscription-form-schema';
import {
  paymentMethodTypes,
  subscriptionBillingCycles,
  subscriptionCategories,
  supportedCurrencies,
  usageFrequencies,
  type SubscriptionWriteInput,
} from '@/types/domain';

import { SubscriptionOptionGroup } from './subscription-option-group';

type SubscriptionFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<SubscriptionWriteInput>;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (input: SubscriptionWriteInput) => Promise<void>;
  submitError?: string | null;
  sourceHint?: string | null;
};

const billingCycleLabels = {
  monthly: 'Monthly',
  yearly: 'Yearly',
} as const;

const currencyLabels = {
  KRW: 'KRW',
  USD: 'USD',
} as const;

const paymentLabels = {
  app_store: 'App Store',
  play_store: 'Play Store',
  card: 'Card',
  paypal: 'PayPal',
  other: 'Other',
} as const;

const usageLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const;

const activeLabels = {
  true: 'Active',
  false: 'Inactive',
} as const;

const trialLabels = {
  true: 'Free trial',
  false: 'Paid subscription',
} as const;

export function SubscriptionForm({
  mode,
  initialValues,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  submitError,
  sourceHint,
}: SubscriptionFormProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: createSubscriptionFormDefaults(initialValues),
  });
  const isTrial = watch('isTrial');

  async function handleValidSubmit(values: SubscriptionFormValues) {
    await onSubmit(mapFormValuesToSubscriptionInput(values));
  }

  return (
    <ThemedView style={styles.page}>
      <ScrollView
        contentInset={{
          top: safeAreaInsets.top,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedView type="surfaceElevated" style={styles.headerCard}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              {mode === 'create' ? 'New subscription' : 'Edit subscription'}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              {mode === 'create' ? 'Add subscription' : 'Update subscription'}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Track billing amount, payment timing, usage, and trial details so Paynesto can
              connect this subscription to your budget.
            </ThemedText>
            {sourceHint ? (
              <ThemedText type="bodySm" themeColor="textSecondary">
                {sourceHint}
              </ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView type="surfaceElevated" style={styles.formCard}>
            <Controller
              control={control}
              name="serviceName"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInputField
                  label="Service name"
                  placeholder="Netflix, ChatGPT Plus, YouTube Premium"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.serviceName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="amount"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInputField
                  label="Billing amount"
                  placeholder="17000 or 20"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  errorMessage={errors.amount?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="nextBillingDate"
              render={({ field: { onChange, value } }) => (
                <TextInputField
                  label="Next billing date"
                  placeholder="2026-04-25"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  errorMessage={errors.nextBillingDate?.message}
                  helperText="Use YYYY-MM-DD so reminders can be scheduled accurately."
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="Category"
                  value={value}
                  options={subscriptionCategories}
                  onChange={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="billingCycle"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="Billing cycle"
                  value={value}
                  options={subscriptionBillingCycles}
                  labels={billingCycleLabels}
                  onChange={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="currency"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="Currency"
                  value={value}
                  options={supportedCurrencies}
                  labels={currencyLabels}
                  onChange={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="paymentMethodType"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="Payment method"
                  value={value}
                  options={paymentMethodTypes}
                  labels={paymentLabels}
                  onChange={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="usageFrequency"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="Usage frequency"
                  value={value}
                  options={usageFrequencies}
                  labels={usageLabels}
                  onChange={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="isTrial"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="Trial tracking"
                  helperText="Mark free trials so Paynesto can highlight conversion risk before paid billing starts."
                  value={String(value) as 'true' | 'false'}
                  options={['true', 'false'] as const}
                  labels={trialLabels}
                  onChange={(nextValue) => onChange(nextValue === 'true')}
                />
              )}
            />

            {isTrial ? (
              <Controller
                control={control}
                name="trialEndDate"
                render={({ field: { onChange, value } }) => (
                  <TextInputField
                    label="Trial end date"
                    placeholder="2026-04-17"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    errorMessage={errors.trialEndDate?.message}
                    helperText="Use YYYY-MM-DD. This powers trial guidance and reminder previews."
                  />
                )}
              />
            ) : null}

            <Controller
              control={control}
              name="isActive"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="Tracking status"
                  value={String(value) as 'true' | 'false'}
                  options={['true', 'false'] as const}
                  labels={activeLabels}
                  onChange={(nextValue) => onChange(nextValue === 'true')}
                />
              )}
            />

            <Controller
              control={control}
              name="note"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInputField
                  label="Note"
                  placeholder="Shared with family, review after payday, cancel if unused"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.note?.message}
                  multiline
                  numberOfLines={4}
                />
              )}
            />

            {submitError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {submitError}
              </ThemedText>
            ) : null}

            <Button
              loading={isSubmitting}
              onPress={handleSubmit(handleValidSubmit)}
              style={styles.submitButton}>
              {submitLabel}
            </Button>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  headerCard: {
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  formCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    maxWidth: 520,
  },
  submitButton: {
    alignSelf: 'stretch',
  },
});
