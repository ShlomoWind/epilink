export const DEFAULT_PRICE_PER_MINUTE = 2.5;
export const PRICE_PER_MINUTE_STORAGE_KEY = 'epilink:price-per-minute';

export function getPricePerMinuteStorageKey(clinicId) {
  return `${PRICE_PER_MINUTE_STORAGE_KEY}:${clinicId}`;
}
