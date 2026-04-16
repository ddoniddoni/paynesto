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
  monthly: '월간',
  yearly: '연간',
} as const;

const currencyLabels = {
  KRW: 'KRW',
  USD: 'USD',
} as const;

const paymentLabels = {
  app_store: 'App Store',
  play_store: 'Play Store',
  card: '카드',
  paypal: 'PayPal',
  other: '기타',
} as const;

const usageLabels = {
  high: '높음',
  medium: '보통',
  low: '낮음',
} as const;

const activeLabels = {
  true: '활성',
  false: '비활성',
} as const;

const trialLabels = {
  true: '체험 중',
  false: '일반 구독',
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
              {mode === 'create' ? '구독 추가' : '구독 수정'}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              구독 금액, 통화, 결제일, 사용 빈도를 입력하면 이후 홈/머니 플랜 단계에서도 바로 연결할 수 있어요.
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
                  label="서비스 이름"
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
                  label="결제 금액"
                  placeholder="17000 또는 20"
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
                  label="다음 결제일"
                  placeholder="2026-04-25"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  errorMessage={errors.nextBillingDate?.message}
                  helperText="YYYY-MM-DD 형식으로 입력해 주세요."
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="카테고리"
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
                  label="결제 주기"
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
                  label="통화"
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
                  label="결제 수단"
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
                  label="사용 빈도"
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
                  label="구독 상태"
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
                    label="체험 종료일"
                    placeholder="2026-04-17"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    errorMessage={errors.trialEndDate?.message}
                    helperText="체험 종료 알림과 해지 후보 계산에 사용됩니다."
                  />
                )}
              />
            ) : null}

            <Controller
              control={control}
              name="isActive"
              render={({ field: { onChange, value } }) => (
                <SubscriptionOptionGroup
                  label="활성 여부"
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
                  label="메모"
                  placeholder="업무용, 가족 공유, 다음 달 해지 검토 등"
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
