import type { ComponentProps } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type MyPageLinkCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel: string;
  tone?: ComponentProps<typeof Card>['tone'];
  onPress: () => void;
};

export function MyPageLinkCard({
  eyebrow,
  title,
  description,
  actionLabel,
  tone = 'default',
  onPress,
}: MyPageLinkCardProps) {
  return (
    <Card tone={tone}>
      {eyebrow ? (
        <ThemedText type="eyebrow" themeColor="textSecondary">
          {eyebrow}
        </ThemedText>
      ) : null}
      <ThemedText type="heading">{title}</ThemedText>
      <ThemedText themeColor="textSecondary">{description}</ThemedText>
      <Button variant={tone === 'accent' ? 'primary' : 'secondary'} onPress={onPress}>
        {actionLabel}
      </Button>
    </Card>
  );
}
