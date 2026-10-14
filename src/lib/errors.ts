export const errorMessage = (error:unknown):string => error instanceof Error ? error.message : '操作失败，请重试';
export const isRecord = (value:unknown):value is Record<string,unknown> => value!==null&&typeof value==='object'&&!Array.isArray(value);
