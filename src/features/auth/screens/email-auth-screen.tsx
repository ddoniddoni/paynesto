import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { useTheme } from '@/hooks/use-theme';

type EmailAuthScreenProps = {
  mode: 'sign-in' | 'sign-up';
  onSubmit: (input: AuthCredentialsInput) => Promise<AuthActionResult>;
  onGoogleSignIn: () => Promise<AuthActionResult>;
  onAlternateAction: () => void;
};

const screenCopy = {
  'sign-in': {
    eyebrow: 'Paynesto',
    title: '구독비를 월급 흐름에\n맞춰 보세요',
    description:
      '체험 모드로 바로 둘러보거나\n계정으로 로그인해 구독, 무료체험,\n예산 가이드를 이어서 관리하세요.',
    submitLabel: '로그인',
    alternatePrompt: '계정이 아직 없다면',
    alternateActionLabel: '회원가입',
  },
  'sign-up': {
    eyebrow: 'Paynesto',
    title: '내 구독 지출을\n정리해볼까요',
    description:
      '이메일 계정을 만들고 구독 목록,\n월급 기반 예산, 결제 알림을\n한곳에서 관리하세요.',
    submitLabel: '회원가입',
    alternatePrompt: '이미 계정이 있다면',
    alternateActionLabel: '로그인',
  },
} as const;

export function EmailAuthScreen({
  mode,
  onSubmit,
  onGoogleSignIn,
  onAlternateAction,
}: EmailAuthScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: viewportWidth } = useWindowDimensions();
  const { status, errorMessage, enterPreviewMode } = useAuthSession();
  const copy = screenCopy[mode];
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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

  async function handleGoogleSubmit() {
    setSubmitError(null);
    setNoticeMessage(null);
    setIsGoogleSubmitting(true);

    try {
      const result = await onGoogleSignIn();

      if (!result.ok) {
        setSubmitError(result.errorMessage);
        return;
      }

      setNoticeMessage(result.noticeMessage ?? null);
    } finally {
      setIsGoogleSubmitting(false);
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
        <View
          style={[
            styles.container,
            { width: Math.min(Math.max(viewportWidth - 72, 280), MaxContentWidth) },
          ]}>
          <View style={styles.heroBlock}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              {copy.eyebrow}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              {copy.title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {copy.description}
            </ThemedText>
          </View>

          {bannerMessage ? (
            <SectionCard
              eyebrow="설정 필요"
              tone="accent"
              title="Supabase 연결 정보가 필요합니다"
              description={bannerMessage}
            />
          ) : null}

          <ThemedView
            type="surfaceElevated"
            style={[styles.formCard, { borderColor: theme.border }]}>
            <View style={styles.previewBlock}>
              <View style={styles.previewCopy}>
                <ThemedText type="heading">먼저 체험해보기</ThemedText>
                <ThemedText type="bodySm" themeColor="textSecondary">
                  샘플 데이터로 홈, 구독 목록,
                  {'\n'}Money Plan을 바로 확인할 수 있습니다.
                </ThemedText>
              </View>
              <Button onPress={() => void enterPreviewMode()} style={styles.primaryButton}>
                Preview 시작
              </Button>
            </View>

            <Button
              variant="secondary"
              loading={isGoogleSubmitting}
              onPress={() => void handleGoogleSubmit()}
              disabled={status === 'unconfigured' || isSubmitting}
              style={styles.primaryButton}>
              Google로 계속
            </Button>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <ThemedText type="bodySm" themeColor="textSecondary">
                또는 이메일로
              </ThemedText>
              <View style={styles.dividerLine} />
            </View>

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
                  editable={status !== 'unconfigured' && !isGoogleSubmitting}
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
                  editable={status !== 'unconfigured' && !isGoogleSubmitting}
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
              disabled={status === 'unconfigured' || isGoogleSubmitting}
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
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 32,
    paddingBottom: 32,
  },
  container: {
    minWidth: 0,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  heroBlock: {
    gap: Spacing.two,
    width: '100%',
    maxWidth: 640,
  },
  title: {
    width: '100%',
    flexShrink: 1,
    maxWidth: 560,
  },
  description: {
    width: '100%',
    flexShrink: 1,
    maxWidth: 620,
  },
  formCard: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    minWidth: 0,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  previewBlock: {
    gap: Spacing.two,
  },
  previewCopy: {
    gap: Spacing.one,
  },
  primaryButton: {
    alignSelf: 'stretch',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(116, 132, 124, 0.28)',
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
