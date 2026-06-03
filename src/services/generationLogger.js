import { analyzeTripQuality } from '@/services/tripQualityEngine';

const OPENAI_PRICING_USD_PER_1M_TOKENS = {
  'gpt-4.1-mini': {
    input: 0.4,
    output: 1.6,
  },
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.6,
  },
};

const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
};

const roundUsd = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Number(number.toFixed(6));
};

const normalizeProvider = (provider) => {
  const value = String(provider || '').toLowerCase();
  if (value.includes('openai')) return 'openai';
  if (value.includes('gemini')) return 'gemini';
  if (value.includes('local')) return 'local';
  return value || null;
};

export const normalizeTokenUsage = (usage = {}) => {
  if (!usage || typeof usage !== 'object') {
    return {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      raw: usage || null,
    };
  }

  const inputTokens =
    Number(usage.input_tokens) ||
    Number(usage.prompt_tokens) ||
    Number(usage.promptTokenCount) ||
    0;

  const outputTokens =
    Number(usage.output_tokens) ||
    Number(usage.completion_tokens) ||
    Number(usage.candidatesTokenCount) ||
    0;

  const totalTokens =
    Number(usage.total_tokens) ||
    Number(usage.totalTokenCount) ||
    inputTokens + outputTokens;

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    raw: usage,
  };
};

export const estimateGenerationCostUsd = ({ provider, model, usage } = {}) => {
  const normalizedProvider = normalizeProvider(provider);

  if (normalizedProvider !== 'openai') {
    return 0;
  }

  const pricing = OPENAI_PRICING_USD_PER_1M_TOKENS[model] || OPENAI_PRICING_USD_PER_1M_TOKENS['gpt-4.1-mini'];
  const normalizedUsage = normalizeTokenUsage(usage);

  const inputCost = (normalizedUsage.input_tokens / 1_000_000) * pricing.input;
  const outputCost = (normalizedUsage.output_tokens / 1_000_000) * pricing.output;

  return roundUsd(inputCost + outputCost);
};

const getValidationWarnings = (trip = {}) => {
  const warnings = [
    ...(trip.post_ai_validation?.warnings || []),
    ...(trip.validation?.warnings || []),
  ];

  return warnings.filter(Boolean);
};

const hasEmptyOrBrokenItinerary = (trip = {}) => {
  return !Array.isArray(trip.itinerary) || trip.itinerary.length === 0;
};

const countEmptyActivityDays = (trip = {}) => {
  if (!Array.isArray(trip.itinerary)) return 0;

  return trip.itinerary.filter((day) => !Array.isArray(day.activities) || day.activities.length === 0).length;
};

const countRepeatedActivityNames = (trip = {}) => {
  if (!Array.isArray(trip.itinerary)) return 0;

  const seen = new Set();
  let duplicates = 0;

  trip.itinerary.forEach((day) => {
    (day.activities || []).forEach((activity) => {
      const name = String(activity?.name || '').trim().toLowerCase();
      if (!name) return;

      if (seen.has(name)) {
        duplicates += 1;
        return;
      }

      seen.add(name);
    });
  });

  return duplicates;
};

const hasWeakLastDay = (trip = {}) => {
  if (!Array.isArray(trip.itinerary) || trip.itinerary.length === 0) return true;

  const lastDay = trip.itinerary[trip.itinerary.length - 1];
  const activities = Array.isArray(lastDay.activities) ? lastDay.activities : [];

  return activities.length === 0;
};

export const calculateInitialQualityScore = ({ trip = {}, generationSource, aiError } = {}) => {
  if (hasEmptyOrBrokenItinerary(trip)) return 0;

  let score = 100;

  if (generationSource === 'local_fallback') score = Math.min(score, 65);
  if (aiError) score = Math.min(score, 55);

  score -= getValidationWarnings(trip).length * 5;
  score -= countEmptyActivityDays(trip) * 12;
  score -= countRepeatedActivityNames(trip) * 3;

  if (hasWeakLastDay(trip)) score -= 15;

  return clamp(Math.round(score));
};

export const buildGenerationLog = ({
  trip = {},
  generationSource = 'unknown',
  aiProvider = null,
  aiError = null,
  fallbackUsed = false,
  promptVersion = null,
  durationMs = null,
  model = null,
  usage = null,
  estimatedCostUsd = null,
  formData = {},
} = {}) => {
  const provider = normalizeProvider(aiProvider || trip.ai_provider);
  const normalizedUsage = normalizeTokenUsage(usage || trip.generation_usage);
  const cost = estimatedCostUsd ?? estimateGenerationCostUsd({
    provider,
    model: model || trip.generation_model,
    usage: normalizedUsage.raw || usage,
  });

  const quality =
    trip.quality && typeof trip.quality === 'object'
      ? trip.quality
      : analyzeTripQuality(trip, formData);

  const qualityScore =
    trip.quality_score ??
    quality?.score ??
    calculateInitialQualityScore({
      trip,
      generationSource,
      aiError,
    });

  return {
    generation_source: generationSource,
    ai_provider: provider,
    ai_error: aiError || null,
    fallback_used: Boolean(fallbackUsed),
    prompt_version: promptVersion,
    duration_ms: Number.isFinite(Number(durationMs)) ? Math.round(Number(durationMs)) : null,
    estimated_cost_usd: roundUsd(cost),
    quality_score: qualityScore,
    quality,
    quality_status: quality?.status || null,
    quality_summary: quality?.summary || null,
    quality_blockers: quality?.blockers || [],
    quality_warnings: quality?.warnings || [],
    quality_repairs: quality?.repairs || [],
    generation_model: model || trip.generation_model || null,
    generation_usage: normalizedUsage,
    generation_trace: {
      generation_source: generationSource,
      ai_provider: provider,
      ai_error: aiError || null,
      fallback_used: Boolean(fallbackUsed),
      prompt_version: promptVersion,
      duration_ms: Number.isFinite(Number(durationMs)) ? Math.round(Number(durationMs)) : null,
      estimated_cost_usd: roundUsd(cost),
      quality_score: qualityScore,
      quality_status: quality?.status || null,
      quality_summary: quality?.summary || null,
      generation_model: model || trip.generation_model || null,
      token_usage: normalizedUsage,
      created_at: new Date().toISOString(),
    },
  };
};
