export function safeJsonParse<T>(jsonString: string | undefined | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    const parsed = JSON.parse(jsonString);
    return (parsed && typeof parsed === 'object') ? (parsed as T) : defaultValue;
  } catch (e) {
    console.warn("JSON parse error, using default value", e);
    return defaultValue;
  }
}
