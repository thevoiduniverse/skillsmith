import { createClient } from "@/lib/supabase/server";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date | null;
}

const HOURLY_REQUEST_LIMIT = 50;
const DAILY_TOKEN_LIMIT = 200_000;

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Check hourly request count
  const { data: hourlyUsage } = await supabase
    .from("api_usage")
    .select("request_count")
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  const hourlyRequests = (hourlyUsage || []).reduce(
    (sum, row) => sum + (row.request_count || 1),
    0
  );

  if (hourlyRequests >= HOURLY_REQUEST_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }

  // Check daily token count
  const { data: dailyUsage } = await supabase
    .from("api_usage")
    .select("input_tokens, output_tokens")
    .eq("user_id", userId)
    .gte("created_at", oneDayAgo);

  const dailyTokens = (dailyUsage || []).reduce(
    (sum, row) => sum + (row.input_tokens || 0) + (row.output_tokens || 0),
    0
  );

  if (dailyTokens >= DAILY_TOKEN_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  return {
    allowed: true,
    remaining: HOURLY_REQUEST_LIMIT - hourlyRequests,
    resetAt: null,
  };
}

export async function recordUsage(
  userId: string,
  endpoint: string,
  inputTokens: number,
  outputTokens: number
) {
  const supabase = await createClient();
  await supabase.from("api_usage").insert({
    user_id: userId,
    endpoint,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    request_count: 1,
  });
}
