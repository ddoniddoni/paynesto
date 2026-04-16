import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ExchangeRateSnapshotRecord = {
  id: string;
  base_currency: 'USD';
  quote_currency: 'KRW';
  rate: number;
  previous_rate: number | null;
  fetched_at: string;
  expires_at: string | null;
  source_label: string;
};

type FrankfurterLatestResponse = {
  base?: string;
  date?: string;
  rates?: {
    KRW?: number;
  };
};

function mapRecordToResponse(record: ExchangeRateSnapshotRecord) {
  return {
    id: record.id,
    baseCurrency: record.base_currency,
    quoteCurrency: record.quote_currency,
    rate: record.rate,
    previousRate: record.previous_rate ?? undefined,
    fetchedAt: record.fetched_at,
    expiresAt: record.expires_at ?? undefined,
    sourceLabel: record.source_label,
  };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = request.headers.get('Authorization');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Supabase Edge Function secrets are not configured.');
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header.' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized request.' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const pairQuery = serviceClient
      .from('exchange_rate_snapshots')
      .select('*')
      .eq('base_currency', 'USD')
      .eq('quote_currency', 'KRW')
      .maybeSingle();

    const [existingSnapshotResult, frankfurterResponse] = await Promise.all([
      pairQuery,
      fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=KRW'),
    ]);

    if (!frankfurterResponse.ok) {
      throw new Error(`Frankfurter request failed with status ${frankfurterResponse.status}.`);
    }

    const frankfurterPayload = (await frankfurterResponse.json()) as FrankfurterLatestResponse;
    const latestRate = frankfurterPayload.rates?.KRW;

    if (!latestRate || frankfurterPayload.base !== 'USD' || !frankfurterPayload.date) {
      throw new Error('Frankfurter payload did not include a valid USD/KRW snapshot.');
    }

    if (existingSnapshotResult.error) {
      throw new Error(existingSnapshotResult.error.message);
    }

    const existingSnapshot = existingSnapshotResult.data as ExchangeRateSnapshotRecord | null;
    const now = new Date();
    const fetchedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const sourceLabel = `Frankfurter USD/KRW (${frankfurterPayload.date})`;

    const { data: savedSnapshot, error: upsertError } = await serviceClient
      .from('exchange_rate_snapshots')
      .upsert(
        {
          base_currency: 'USD',
          quote_currency: 'KRW',
          rate: latestRate,
          previous_rate: existingSnapshot?.rate ?? null,
          fetched_at: fetchedAt,
          expires_at: expiresAt,
          source_label: sourceLabel,
          updated_at: fetchedAt,
        },
        {
          onConflict: 'base_currency,quote_currency',
        }
      )
      .select('*')
      .single();

    const snapshotRecord =
      upsertError || !savedSnapshot
        ? ({
            id: existingSnapshot?.id ?? 'fx-usd-krw-live',
            base_currency: 'USD',
            quote_currency: 'KRW',
            rate: latestRate,
            previous_rate: existingSnapshot?.rate ?? null,
            fetched_at: fetchedAt,
            expires_at: expiresAt,
            source_label: sourceLabel,
          } satisfies ExchangeRateSnapshotRecord)
        : (savedSnapshot as ExchangeRateSnapshotRecord);

    return new Response(
      JSON.stringify({
        snapshot: mapRecordToResponse(snapshotRecord),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected FX function failure.';

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
