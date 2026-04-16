import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { TextInputField } from '@/components/ui/text-input-field';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import {
  AUTH_CONFIG_ERROR_MESSAGE,
  type AuthActionResult,
} from '@/features/auth/services/auth-service';
import {
  authCredentialsSchema,
  type AuthCredentialsInput,
} from '@/features/auth/schemas/auth-credentials-schema';

type EmailAuthScreenProps = {
  mode: 'sign-in' | 'sign-up';
  onSubmit: (input: AuthCredentialsInput) => Promise<AuthActionResult>;
  onAlternateAction: () => void;
};

const screenCopy = {
  'sign-in': {
    eyebrow: 'Paynesto auth',
    title: '로그인',
    description: '구독 관리와 머니 플랜을 계속 보려면 계정으로 로그인해 주세요.',
    submitLabel: '로그인',
    alternatePrompt: '계정이 아직 없다면',
    alternateActionLabel: '회원가입',
  },
  'sign-up': {
    eyebrow: 'Paynesto auth',
    title: '회원가입',
    description: '이메일과 비밀번호로 계정을 만들고 이후 구독/예산 데이터를 연결할 준비를 합니다.',
    submitLabel: '회원가입',
    alternatePrompt: '이미 계정이 있다면',
    alternateActionLabel: '로그인',
  },
} as const;

export function EmailAuthScreen({
  mode,
  onSubmit,
  onAlternateAction,
}: EmailAuthScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { status, errorMessage } = useAuthSession();
  const copy = screenCopy[mode];
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthCredentialsInput>({
    resolver: zodResolver(authCredentialsSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleFormSubmit(values: AuthCredentialsInput) {
    setSubmitError(null);
    setNoticeMessage(null);

    const result = await onSubmit(values);

    if (!result.ok) {
      setSubmitError(result.errorMessage);
      return;
    }

    setNoticeMessage(result.noticeMessage ?? null);

    if (mode === 'sign-up') {
      reset({
        email: values.email.trim().toLowerCase(),
        password: '',
      });
    }
  }

  const bannerMessage =
    status === 'unconfigured'
      ? AUTH_CONFIG_ERROR_MESSAGE
      : status === 'error'
        ? errorMessage
        : null;

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
          <ThemedView type="surfaceElevated" style={styles.heroCard}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              {copy.eyebrow}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              {copy.title}
            </ThemedText>
            <ThemedText themeColor="textSecondary">{copy.description}</ThemedText>
          </ThemedView>

          {bannerMessage ? (
            <SectionCard
              eyebrow="설정 필요"
              tone="accent"
              title="Supabase 연결 정보가 아직 없습니다"
              description={bannerMessage}
            />
          ) : null}

          <ThemedView type="surfaceElevated" style={styles.formCard}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInputField
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  label="이메일"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="email@address.com"
                  value={value}
                  errorMessage={errors.email?.message}
                  editable={status !== 'unconfigured'}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInputField
                  autoCapitalize="none"
                  autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                  label="비밀번호"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="6자 이상 입력"
                  secureTextEntry
                  value={value}
                  errorMessage={errors.password?.message}
                  editable={status !== 'unconfigured'}
                />
              )}
            />

            {submitError ? (
              <ThemedText type="bodySm" themeColor="danger">
                {submitError}
              </ThemedText>
            ) : null}

            {noticeMessage ? (
              <ThemedText type="bodySm" themeColor="success">
                {noticeMessage}
              </ThemedText>
            ) : null}

            <Button
              loading={isSubmitting}
              onPress={handleSubmit(handleFormSubmit)}
              disabled={status === 'unconfigured'}
              style={styles.primaryButton}>
              {copy.submitLabel}
            </Button>

            <View style={styles.switchRow}>
              <ThemedText type="bodySm" themeColor="textSecondary">
                {copy.alternatePrompt}
              </ThemedText>
              <Button variant="ghost" onPress={onAlternateAction} style={styles.inlineButton}>
                {copy.alternateActionLabel}
              </Button>
            </View>
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
  heroCard: {
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    maxWidth: 520,
  },
  formCard: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  primaryButton: {
    alignSelf: 'stretch',
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  inlineButton: {
    minWidth: 0,
    paddingHorizontal: 0,
  },
});
