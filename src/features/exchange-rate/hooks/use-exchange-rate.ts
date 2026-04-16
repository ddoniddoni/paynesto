import { useQuery } from '@tanstack/react-query';

import { getExchangeRateRepository } from '@/features/exchange-rate/repositories/exchange-rate-repository';

const exchangeRateKeys = {
  all: ['exchange-rate'] as const,
  latestUsdKrw: ['exchange-rate', 'USD', 'KRW', 'latest'] as const,
};

export function useLatestUsdKrwSnapshotQuery() {
  return useQuery({
    queryKey: exchangeRateKeys.latestUsdKrw,
    queryFn: () => getExchangeRateRepository().getLatestUsdKrwSnapshot(),
  });
}
