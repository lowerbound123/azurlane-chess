import {isRecord} from '../src/lib/errors.ts';
const record=(value:unknown):Record<string,unknown>=>isRecord(value)?value:{};
import { createHash } from 'node:crypto';

const tokenCount = (value:unknown):value is number => typeof value==='number'&&Number.isSafeInteger(value) && value >= 0;
const amount = (value:unknown):value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const pickNumbers = (input:unknown, keys:readonly string[], valid: (value:unknown)=>boolean = tokenCount):Record<string,unknown> => {const value=record(input);return Object.fromEntries(keys
  .filter(key => valid(value?.[key])).map(key => [key, value[key]]));};
const TOKEN_FIELDS = ['input_tokens', 'output_tokens', 'total_tokens', 'prompt_tokens', 'completion_tokens', 'prompt_cache_hit_tokens', 'prompt_cache_miss_tokens'];
const INPUT_DETAILS = ['cached_tokens', 'cache_write_tokens', 'text_tokens', 'audio_tokens', 'image_tokens'];
const OUTPUT_DETAILS = ['reasoning_tokens', 'text_tokens', 'audio_tokens', 'accepted_prediction_tokens', 'rejected_prediction_tokens'];
const MONEY_FIELDS = ['cost', 'price', 'amount', 'total_cost', 'input_cost', 'output_cost', 'prompt_cost', 'completion_cost', 'cache_read_cost', 'cache_write_cost', 'input_price', 'output_price', 'cached_input_price', 'cache_write_price'];
const COST_DETAILS = ['upstream_inference_cost', 'upstream_inference_prompt_cost', 'upstream_inference_completions_cost'];

export function safeUsage(input:unknown) {
  const value=record(input);
  const usage = pickNumbers(value, TOKEN_FIELDS);
  for (const [key, fields] of [['input_tokens_details', INPUT_DETAILS], ['prompt_tokens_details', INPUT_DETAILS], ['output_tokens_details', OUTPUT_DETAILS], ['completion_tokens_details', OUTPUT_DETAILS]] as const) {
    const details = pickNumbers(value?.[key], fields);
    if (Object.keys(details).length) usage[key] = details;
  }
  return usage;
}

// Some compatible APIs report prices; keep their numeric fields verbatim, never
// infer a currency, manufacture a charge, or copy arbitrary provider metadata.
export function safeBilling(input:unknown, secret?:string) {
  const data=record(input),billing:Record<string,unknown> = {};
  for (const [source, value] of [['response', data], ['usage', data?.usage], ['billing', data?.billing], ['pricing', data?.pricing]] as const) {
    const object=record(value);
    const fields = pickNumbers(object, MONEY_FIELDS, amount);
    const details = pickNumbers(object.cost_details, COST_DETAILS, amount);
    if (Object.keys(details).length) fields.cost_details = details;
    if (!Object.keys(fields).length) continue;
    if (typeof object.currency === 'string' && /^[A-Za-z]{3}$/.test(object.currency) &&
        !(typeof secret === 'string' && secret && object.currency.includes(secret))) fields.currency = object.currency.toUpperCase();
    billing[source] = fields;
  }
  return Object.keys(billing).length ? billing : null;
}

export function safeIdentifier(value:unknown, secret?:string) {
  return typeof value === 'string' && /^[A-Za-z0-9_.:/-]{1,200}$/.test(value) &&
    !(typeof secret === 'string' && secret && value.includes(secret)) ? value : null;
}

export function safeEndpoint(value:string, secret?:string) {
  try {
    const url = new URL(value), endpoint = url.origin + url.pathname;
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && endpoint.length <= 512 &&
      !(typeof secret === 'string' && secret && endpoint.includes(secret)) ? endpoint : null;
  } catch { return null; }
}

export function fingerprint(text:string) {
  return { bytes: Buffer.byteLength(text), sha256: createHash('sha256').update(text).digest('hex') };
}

export function summarizeRequest(input:unknown, serialized:string, model:{apiKey:string;timeoutMs?:number}) {
  const body=record(input), messages=Array.isArray(body.input)?body.input:Array.isArray(body.messages)?body.messages:[];
  const format = record(body.text).format ?? record(body.response_format).json_schema;
  return {
    reasoningEffort: safeIdentifier(record(body.reasoning).effort ?? body.reasoning_effort, model.apiKey),
    serviceTier: body.service_tier ?? null,
    maxOutputTokens: body.max_output_tokens ?? body.max_completion_tokens,
    timeoutMs: model.timeoutMs ?? 60000,
    structuredOutput: Boolean(format),
    bodyBytes: Buffer.byteLength(serialized),
    context: {
      messageCount: messages.length,
      ...fingerprint(JSON.stringify(messages)),
      messages: messages.map(value => {const message=record(value);return ({
        role: ['system', 'developer', 'user', 'assistant', 'tool'].includes(String(message.role)) ? message.role : null,
        ...fingerprint(typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? null)),
      });}),
    },
    schema: record(format).schema ? fingerprint(JSON.stringify(record(format).schema)) : null,
  };
}

export function responseHeaders(response:Response, secret?:string) {
  const numericHeader = (name:string) => {
    const value = response.headers?.get?.(name);
    return typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value) && amount(Number(value)) ? Number(value) : null;
  };
  return {
    requestId: safeIdentifier(response.headers?.get?.('x-request-id'), secret),
    processingMs: numericHeader('openai-processing-ms'),
    contentLength: numericHeader('content-length'),
    bodyBytes: 0,
  };
}

export function summarizeResponse(input:unknown, secret?:string) {
  const data=record(input),choices=Array.isArray(data.choices)?data.choices:[];
  const status = ['completed', 'incomplete', 'failed', 'in_progress', 'queued', 'cancelled'].includes(String(data.status)) ? data.status : null;
  const finishReason = record(choices[0]).finish_reason;
  const incompleteReason = record(data.incomplete_details).reason;
  const createdAt = data?.created_at ?? data?.created;
  return {
    id: safeIdentifier(data?.id, secret),
    model: safeIdentifier(data?.model, secret),
    createdAt: tokenCount(createdAt) ? createdAt : null,
    status,
    finishReason: ['stop', 'length', 'content_filter', 'tool_calls', 'function_call', 'insufficient_system_resource', 'aborted'].includes(String(finishReason)) ? finishReason : null,
    incompleteReason: ['max_output_tokens', 'content_filter'].includes(String(incompleteReason)) ? incompleteReason : null,
    error: data?.error ? { code: safeIdentifier(record(data.error).code, secret), type: safeIdentifier(record(data.error).type, secret) } : null,
    output: null,
  };
}
