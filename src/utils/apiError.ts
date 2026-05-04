export function extractApiErrorMessage(error: any, fallback: string) {
  const data = error?.response?.data;

  if (!data) return error?.message || fallback;
  if (typeof data === 'string') return data;

  if (data.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    const firstValue = firstKey ? data.errors[firstKey] : null;
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return firstValue[0];
    }
    if (typeof firstValue === 'string' && firstValue.trim()) {
      return firstValue;
    }
  }

  const detail = data.detail || data.title || data.message;
  if (detail) return detail;

  return error?.message || fallback;
}
