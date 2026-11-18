const RESTAURANT_CHOICE_KEY = 'rebuild_chosen_restaurant_v2';
const LEGACY_RESTAURANT_KEYS = ['rebuild_chosen_restaurant_v1'];

function cookieSecurityAttr() {
  return window.location.protocol === 'https:' ? '; Secure' : '';
}

export function clearLegacyRestaurantChoices() {
  for (const key of LEGACY_RESTAURANT_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore restricted storage environments.
    }
    document.cookie = `${key}=; max-age=0; path=/; SameSite=Lax${cookieSecurityAttr()}`;
  }
}

function readCookieChoice(validOptions) {
  const prefix = `${RESTAURANT_CHOICE_KEY}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      const value = decodeURIComponent(part.slice(prefix.length));
      return Object.prototype.hasOwnProperty.call(validOptions, value) ? value : null;
    }
  }
  return null;
}

export function persistRestaurantChoice(letter, validOptions) {
  if (!Object.prototype.hasOwnProperty.call(validOptions, letter)) return;
  try {
    window.localStorage.setItem(RESTAURANT_CHOICE_KEY, letter);
  } catch {
    // Ignore privacy/quota storage blocks; cookie fallback persists choice.
  }
  document.cookie = `${RESTAURANT_CHOICE_KEY}=${encodeURIComponent(letter)}; max-age=31536000; path=/; SameSite=Lax${cookieSecurityAttr()}`;
}

export function getPersistedRestaurantChoice(validOptions) {
  let lsValue = null;
  try {
    const raw = window.localStorage.getItem(RESTAURANT_CHOICE_KEY);
    if (raw && Object.prototype.hasOwnProperty.call(validOptions, raw)) {
      lsValue = raw;
    }
  } catch {
    lsValue = null;
  }

  const cookieValue = readCookieChoice(validOptions);
  const resolved = lsValue || cookieValue;
  if (resolved && (!lsValue || !cookieValue)) {
    persistRestaurantChoice(resolved, validOptions);
  }
  return resolved;
}
