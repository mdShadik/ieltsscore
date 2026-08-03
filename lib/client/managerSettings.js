const MANAGER_USE_MIN_BALANCE_KEY = 'ieltsscore_use_min_balance';

export function getUseMinBalance() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(MANAGER_USE_MIN_BALANCE_KEY);
    return raw ? JSON.parse(raw) === true : false;
  } catch {
    return false;
  }
}

export function setUseMinBalance(value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MANAGER_USE_MIN_BALANCE_KEY, JSON.stringify(Boolean(value)));
  window.dispatchEvent(
    new CustomEvent('ieltsscore:manager-settings-changed', {
      detail: { useMinBalance: Boolean(value) },
    })
  );
}
