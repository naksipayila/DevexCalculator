const DEVEX_RATE = 0.0038;
const DEVEX_MIN_ROBUX = 30_000;
const TAX_RATE = 0.30;
const TAX_MAX_ROBUX = 1_000_000_000;
const MAX_MAIN_ROBUX_DIGITS = 15;
const DEFAULT_TRY_RATE = 46.00;
const RATE_STALE_MS = 6 * 60 * 60 * 1000;
const STORAGE_KEYS = {
    marketTryRate: 'tryRate',
    marketTryRateTimestamp: 'tryRateTimestamp',
    manualTryRate: 'tryRateManual',
    calculatorRobux: 'calculatorRobux',
    calculatorUsd: 'calculatorUsd',
    calculatorInputSource: 'calculatorInputSource',
    taxNetRobux: 'taxNetRobux',
    taxPanelOpen: 'taxPanelOpen',
    theme: 'theme'
};

let robux = '';
let usd = '';
let entryMode = 'robux';
let tryRate = DEFAULT_TRY_RATE;
let marketTryRate = DEFAULT_TRY_RATE;
let marketRateSource = 'default';
let manualTryRate = null;
let rateSource = 'default';
let rateUpdatedAt = null;
let toastTimer = null;
let announceTimer = null;
let isRateRequestInFlight = false;

const root = document.documentElement;
const metaThemeColor = document.getElementById('metaThemeColor');
const themeToggle = document.getElementById('themeToggle');
const modeRobuxBtn = document.getElementById('modeRobuxBtn');
const modeUsdBtn = document.getElementById('modeUsdBtn');
const heroInput = document.getElementById('heroInput');
const heroPrefix = document.getElementById('heroPrefix');
const clearBtn = document.getElementById('clearBtn');
const thresholdHint = document.getElementById('thresholdHint');
const robuxRow = document.getElementById('robuxRow');
const resultRobux = document.getElementById('resultRobux');
const robuxCopyBtn = document.getElementById('robuxCopyBtn');
const usdRow = document.getElementById('usdRow');
const resultUsd = document.getElementById('resultUsd');
const resultTry = document.getElementById('resultTry');
const usdCopyBtn = document.getElementById('usdCopyBtn');
const tryCopyBtn = document.getElementById('tryCopyBtn');
const taxToggleBtn = document.getElementById('taxToggleBtn');
const taxPanel = document.getElementById('taxPanel');
const grossSummaryValue = document.getElementById('grossSummaryValue');
const netRobuxInput = document.getElementById('netRobuxInput');
const feeDisplay = document.getElementById('feeDisplay');
const grossDisplay = document.getElementById('grossDisplay');
const grossCopyBtn = document.getElementById('grossCopyBtn');
const useMainRobuxBtn = document.getElementById('useMainRobuxBtn');
const clearTaxBtn = document.getElementById('clearTaxBtn');
const devexChip = document.getElementById('devexChip');
const tryRateInput = document.getElementById('tryRateInput');
const refreshRateBtn = document.getElementById('refreshRateBtn');
const resetRateBtn = document.getElementById('resetRateBtn');
const rateDot = document.getElementById('rateDot');
const rateStatusText = document.getElementById('rateStatusText');
const toast = document.getElementById('toast');
const liveAnnounce = document.getElementById('liveAnnounce');

const getStoredItem = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
};

const setStoredItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Storage can be unavailable in some embedded browser contexts.
    }
};

const removeStoredItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        // Storage can be unavailable in some embedded browser contexts.
    }
};

const formatNumber = (value) => {
    if (value === '' || value === null || value === undefined) return '';

    const digits = value.toString().replace(/\D/g, '');
    if (!digits) return '';

    return Number(digits).toLocaleString('en-US');
};

const parseRobux = (value) => {
    const clean = value.toString().replace(/\D/g, '');
    return Number(clean) || 0;
};

const parseUsd = (value) => {
    const cleaned = value.toString().trim().replace(/[^0-9.,]/g, '');
    if (!cleaned) return 0;

    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    const normalized = lastComma > lastDot
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
    const parts = normalized.split('.');
    const decimalSafe = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : normalized;

    return Number.parseFloat(decimalSafe) || 0;
};

const formatAmount = (value) => value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const sanitizeUsdText = (value) => {
    const cleaned = value.replace(/[^0-9.,]/g, '');
    const separatorIndex = cleaned.search(/[.,]/);
    if (separatorIndex === -1) return cleaned;

    const intPart = cleaned.slice(0, separatorIndex);
    const decPart = cleaned.slice(separatorIndex + 1).replace(/[.,]/g, '').slice(0, 2);

    return `${intPart}.${decPart}`;
};

const getTimeLabel = (timestamp) => {
    if (!timestamp) return null;

    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp));
};

const hasManualTryRate = () => Number.isFinite(manualTryRate) && manualTryRate > 0;

const syncEffectiveRate = () => {
    if (hasManualTryRate()) {
        tryRate = manualTryRate;
        rateSource = 'manual';
        return;
    }

    tryRate = marketTryRate;
    rateSource = marketRateSource;
};

const isMarketRateStale = () => (
    ['live', 'cache'].includes(marketRateSource)
    && (!rateUpdatedAt || Date.now() - rateUpdatedAt > RATE_STALE_MS)
);

const setFormattedValueKeepingCaret = (input, formattedValue) => {
    if (input.value === formattedValue) return;

    const previousValue = input.value;
    const selectionStart = input.selectionStart ?? previousValue.length;
    const digitsBeforeCaret = previousValue.slice(0, selectionStart).replace(/\D/g, '').length;

    input.value = formattedValue;

    let digitsSeen = 0;
    let caretPosition = 0;

    for (let index = 0; index < formattedValue.length; index += 1) {
        if (/\d/.test(formattedValue[index])) {
            digitsSeen += 1;
        }

        if (digitsSeen >= digitsBeforeCaret) {
            caretPosition = index + 1;
            break;
        }
    }

    if (digitsBeforeCaret === 0) {
        caretPosition = 0;
    } else if (digitsSeen < digitsBeforeCaret) {
        caretPosition = formattedValue.length;
    }

    input.setSelectionRange(caretPosition, caretPosition);
};

const showToast = (message) => {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
};

const queueAnnouncement = (rawUsd, tryDisplay) => {
    clearTimeout(announceTimer);

    if (!robux && !rawUsd) {
        liveAnnounce.textContent = '';
        return;
    }

    const message = `Robux ${formatNumber(robux)}. USD ${formatAmount(rawUsd)}. TRY ${tryDisplay}.`;
    announceTimer = setTimeout(() => {
        liveAnnounce.textContent = '';
        requestAnimationFrame(() => {
            liveAnnounce.textContent = message;
        });
    }, 500);
};

const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    themeToggle.setAttribute('aria-label', theme === 'light' ? 'Use dark theme' : 'Use light theme');
    metaThemeColor.content = theme === 'light' ? '#eef1f6' : '#0f1115';

    if (persist) {
        setStoredItem(STORAGE_KEYS.theme, theme);
    }
};

const initializeTheme = () => {
    const storedTheme = getStoredItem(STORAGE_KEYS.theme);
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme;
    applyTheme(theme);
};

const clearAmounts = () => {
    robux = '';
    usd = '';
};

function setFromRobux(value) {
    entryMode = 'robux';
    robux = value.toString().replace(/\D/g, '').slice(0, MAX_MAIN_ROBUX_DIGITS);
    usd = robux ? (parseRobux(robux) * DEVEX_RATE).toFixed(2) : '';
}

function setFromUsd(value) {
    entryMode = 'usd';
    const rawUsd = parseUsd(value);
    usd = value && value.toString().trim() && rawUsd ? rawUsd.toFixed(2) : '';
    robux = usd ? String(Math.round(rawUsd / DEVEX_RATE)) : '';
}

const renderHeroValue = () => {
    heroInput.value = entryMode === 'robux' ? formatNumber(robux) : (usd ? formatAmount(parseUsd(usd)) : '');
};

const applyEntryMode = (mode) => {
    entryMode = mode;
    const isRobux = mode === 'robux';

    modeRobuxBtn.classList.toggle('is-active', isRobux);
    modeUsdBtn.classList.toggle('is-active', !isRobux);
    modeRobuxBtn.setAttribute('aria-pressed', String(isRobux));
    modeUsdBtn.setAttribute('aria-pressed', String(!isRobux));

    heroPrefix.textContent = isRobux ? 'R$' : '$';
    heroInput.setAttribute('inputmode', isRobux ? 'numeric' : 'decimal');
    heroInput.setAttribute('aria-label', isRobux ? 'Robux amount' : 'USD amount');

    if (document.activeElement !== heroInput) {
        renderHeroValue();
    }
};

const persistCalculatorState = () => {
    if (!robux && !usd) {
        removeStoredItem(STORAGE_KEYS.calculatorRobux);
        removeStoredItem(STORAGE_KEYS.calculatorUsd);
        removeStoredItem(STORAGE_KEYS.calculatorInputSource);
        return;
    }

    setStoredItem(STORAGE_KEYS.calculatorRobux, robux);
    setStoredItem(STORAGE_KEYS.calculatorUsd, usd);
    setStoredItem(STORAGE_KEYS.calculatorInputSource, entryMode);
};

const restoreCalculatorState = () => {
    const storedSource = getStoredItem(STORAGE_KEYS.calculatorInputSource);
    const storedRobux = getStoredItem(STORAGE_KEYS.calculatorRobux);
    const storedUsd = getStoredItem(STORAGE_KEYS.calculatorUsd);

    if (storedSource === 'usd' && storedUsd) {
        setFromUsd(storedUsd);
    } else if (storedRobux) {
        setFromRobux(storedRobux);
    } else {
        entryMode = 'robux';
    }
};

const updateThresholdHint = () => {
    const robuxValue = parseRobux(robux);
    const shouldShowHint = robuxValue > 0 && robuxValue < DEVEX_MIN_ROBUX;

    thresholdHint.hidden = !shouldShowHint;
    if (shouldShowHint) {
        thresholdHint.textContent = `Below DevEx minimum (${formatNumber(DEVEX_MIN_ROBUX)} R$)`;
    }
};

const calculateTaxNet = (value) => Math.min(parseRobux(value), TAX_MAX_ROBUX);

const calculateGross = (net) => (net > 0 ? Math.ceil(net / (1 - TAX_RATE)) : 0);

const refreshTaxDisplays = () => {
    const net = calculateTaxNet(netRobuxInput.value);
    const gross = calculateGross(net);
    const fee = gross - net;

    grossDisplay.textContent = `${formatNumber(gross)} R$`;
    feeDisplay.textContent = `${formatNumber(fee)} R$`;
    grossSummaryValue.textContent = gross ? `${formatNumber(gross)} R$` : '—';
    grossSummaryValue.classList.toggle('is-zero', !gross);

    const robuxValue = parseRobux(robux);
    useMainRobuxBtn.hidden = robuxValue === 0;
    if (robuxValue > 0) {
        useMainRobuxBtn.textContent = `Use ${formatNumber(robuxValue)} R$`;
    }

    clearTaxBtn.hidden = net === 0;
};

const persistTaxCalculator = () => {
    const net = calculateTaxNet(netRobuxInput.value);

    if (net > 0) {
        setStoredItem(STORAGE_KEYS.taxNetRobux, net.toString());
    } else {
        removeStoredItem(STORAGE_KEYS.taxNetRobux);
    }
};

const setTaxNetRobux = (value) => {
    const net = calculateTaxNet(value);
    netRobuxInput.value = net ? formatNumber(net) : '';

    refreshTaxDisplays();
    persistTaxCalculator();
};

const clearTaxCalculator = ({ focus = false } = {}) => {
    netRobuxInput.value = '';
    refreshTaxDisplays();
    removeStoredItem(STORAGE_KEYS.taxNetRobux);

    if (focus) {
        netRobuxInput.focus();
    }
};

const restoreTaxCalculator = () => {
    const storedNet = getStoredItem(STORAGE_KEYS.taxNetRobux);

    if (storedNet && parseRobux(storedNet) > 0) {
        setTaxNetRobux(storedNet);
    } else {
        refreshTaxDisplays();
    }
};

const setTaxPanelOpen = (open, { focusNet = false } = {}) => {
    taxPanel.hidden = !open;
    taxToggleBtn.setAttribute('aria-expanded', String(open));
    setStoredItem(STORAGE_KEYS.taxPanelOpen, open ? 'true' : 'false');

    if (open) {
        if (focusNet) {
            netRobuxInput.focus();
            if (netRobuxInput.value) netRobuxInput.select();
        }
    } else if (taxPanel.contains(document.activeElement)) {
        taxToggleBtn.focus();
    }
};

const renderRateStatus = () => {
    const statusClasses = ['is-live', 'is-cache', 'is-manual', 'is-default', 'is-stale'];
    rateDot.classList.remove(...statusClasses);
    rateDot.classList.add(`is-${rateSource}`);
    resetRateBtn.hidden = rateSource !== 'manual';

    if (isRateRequestInFlight) {
        rateStatusText.textContent = rateSource === 'manual'
            ? 'Manual rate active; checking live rate'
            : 'Checking live rate';
        return;
    }

    const timeLabel = getTimeLabel(rateUpdatedAt);

    if (rateSource === 'manual') {
        rateStatusText.textContent = 'Manual rate active';
    } else if (isMarketRateStale()) {
        rateDot.classList.remove(`is-${rateSource}`);
        rateDot.classList.add('is-stale');
        rateStatusText.textContent = timeLabel ? `Rate from ${timeLabel} may be stale` : 'Rate may be stale';
    } else if (rateSource === 'live') {
        rateStatusText.textContent = timeLabel ? `Updated ${timeLabel}` : 'Live rate';
    } else if (rateSource === 'cache') {
        rateStatusText.textContent = timeLabel ? `Cached ${timeLabel}` : 'Cached rate';
    } else {
        rateStatusText.textContent = 'Offline - default rate';
    }
};

const updateUI = ({ announce = true } = {}) => {
    const rawUsd = parseUsd(usd);
    const tryDisplay = formatAmount(rawUsd * tryRate);

    if (document.activeElement !== heroInput) {
        renderHeroValue();
    }

    const isUsdMode = entryMode === 'usd';
    robuxRow.hidden = !isUsdMode;
    usdRow.hidden = isUsdMode;
    if (isUsdMode) {
        const robuxValue = parseRobux(robux);
        resultRobux.textContent = `R$${formatNumber(robux) || '0'}`;
        resultRobux.classList.toggle('is-zero', !robuxValue);
    }

    resultUsd.textContent = `$${formatAmount(rawUsd)}`;
    resultUsd.classList.toggle('is-zero', !rawUsd);
    resultTry.textContent = `₺${tryDisplay}`;
    resultTry.classList.toggle('is-zero', !rawUsd);

    if (document.activeElement !== tryRateInput) {
        tryRateInput.value = tryRate.toFixed(2);
    }

    clearBtn.hidden = !robux && !usd;
    updateThresholdHint();
    refreshTaxDisplays();
    renderRateStatus();

    if (announce) {
        queueAnnouncement(rawUsd, tryDisplay);
    }
};

const restoreCachedRate = () => {
    const cachedRate = Number.parseFloat(getStoredItem(STORAGE_KEYS.marketTryRate));
    if (!Number.isFinite(cachedRate) || cachedRate <= 0) return false;

    marketTryRate = cachedRate;
    marketRateSource = 'cache';
    const timestamp = Number.parseInt(getStoredItem(STORAGE_KEYS.marketTryRateTimestamp), 10);
    rateUpdatedAt = Number.isFinite(timestamp) ? timestamp : null;
    return true;
};

const restoreManualRate = () => {
    const storedManualRate = Number.parseFloat(getStoredItem(STORAGE_KEYS.manualTryRate));

    if (Number.isFinite(storedManualRate) && storedManualRate > 0) {
        manualTryRate = storedManualRate;
    }
};

const clearManualRate = () => {
    manualTryRate = null;
    removeStoredItem(STORAGE_KEYS.manualTryRate);
};

const fetchExchangeRate = async (userInitiated = false) => {
    if (isRateRequestInFlight) return;

    isRateRequestInFlight = true;
    refreshRateBtn.classList.add('is-loading');
    refreshRateBtn.disabled = true;
    renderRateStatus();

    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Rate service did not respond: ${response.status}`);
        }

        const data = await response.json();
        const liveRate = Number(data?.rates?.TRY);

        if (!Number.isFinite(liveRate) || liveRate <= 0) {
            throw new Error('Rate service returned an invalid TRY rate');
        }

        marketTryRate = liveRate;
        marketRateSource = 'live';
        rateUpdatedAt = Date.now();
        setStoredItem(STORAGE_KEYS.marketTryRate, marketTryRate.toString());
        setStoredItem(STORAGE_KEYS.marketTryRateTimestamp, rateUpdatedAt.toString());
        syncEffectiveRate();
        updateUI({ announce: false });

        if (userInitiated) {
            showToast(rateSource === 'manual' ? 'Live rate updated; manual rate remains active' : 'Live rate updated');
        }
    } catch (error) {
        console.error('Exchange rate could not be fetched:', error);

        if (marketRateSource === 'default') {
            restoreCachedRate();
        }

        syncEffectiveRate();
        updateUI({ announce: false });

        if (userInitiated) {
            if (rateSource === 'manual') {
                showToast('Rate could not be updated; manual rate remains active');
            } else {
                showToast(rateSource === 'cache' ? 'Using cached rate' : 'Rate could not be updated');
            }
        }
    } finally {
        isRateRequestInFlight = false;
        refreshRateBtn.classList.remove('is-loading');
        refreshRateBtn.disabled = false;
        renderRateStatus();
    }
};

const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Use the legacy fallback below for browsers that reject clipboard access.
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand('copy');
    } catch (error) {
        return false;
    } finally {
        textarea.remove();
    }
};

const copyRobux = async () => {
    const robuxValue = parseRobux(robux);
    if (!robuxValue) return;

    if (await copyText(robuxValue.toString())) {
        showToast('Robux copied');
    }
};

const copyUsd = async () => {
    const rawUsd = parseUsd(usd);
    if (!rawUsd) return;

    if (await copyText(rawUsd.toFixed(2))) {
        showToast('USD copied');
    }
};

const copyTry = async () => {
    const rawUsd = parseUsd(usd);
    if (!rawUsd) return;

    if (await copyText((rawUsd * tryRate).toFixed(2))) {
        showToast('TRY copied');
    }
};

const copyGross = async () => {
    const gross = calculateGross(calculateTaxNet(netRobuxInput.value));
    if (!gross) return;

    if (await copyText(gross.toString())) {
        showToast('Gross Robux copied');
    }
};

themeToggle.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
});

[modeRobuxBtn, modeUsdBtn].forEach((button) => {
    button.addEventListener('click', () => {
        if (button.dataset.mode !== entryMode) {
            applyEntryMode(button.dataset.mode);
            persistCalculatorState();
            updateUI({ announce: false });
            renderHeroValue();
        }

        heroInput.focus();
        heroInput.select();
    });
});

heroInput.addEventListener('focus', () => heroInput.select());
heroInput.addEventListener('input', (event) => {
    if (entryMode === 'robux') {
        const digits = event.target.value.replace(/\D/g, '').slice(0, MAX_MAIN_ROBUX_DIGITS);
        setFormattedValueKeepingCaret(event.target, formatNumber(digits));
        setFromRobux(digits);
    } else {
        const sanitized = sanitizeUsdText(event.target.value);
        setFormattedValueKeepingCaret(event.target, sanitized);
        setFromUsd(sanitized);
    }

    persistCalculatorState();
    updateUI();
});
heroInput.addEventListener('blur', () => renderHeroValue());

clearBtn.addEventListener('click', () => {
    heroInput.blur();
    clearAmounts();
    persistCalculatorState();
    updateUI();
    heroInput.focus();
});

taxToggleBtn.addEventListener('click', () => {
    setTaxPanelOpen(taxPanel.hidden, { focusNet: taxPanel.hidden });
});

netRobuxInput.addEventListener('input', (event) => {
    const digits = event.target.value.replace(/\D/g, '');
    const net = calculateTaxNet(digits);
    setFormattedValueKeepingCaret(event.target, net ? formatNumber(net) : '');
    refreshTaxDisplays();
    persistTaxCalculator();
});

useMainRobuxBtn.addEventListener('click', () => {
    const current = parseRobux(robux);
    if (!current) return;

    setTaxNetRobux(current);
    netRobuxInput.focus();
    netRobuxInput.select();
    showToast('Current Robux added to tax calculator');
});

clearTaxBtn.addEventListener('click', () => clearTaxCalculator({ focus: true }));
grossCopyBtn.addEventListener('click', copyGross);
robuxCopyBtn.addEventListener('click', copyRobux);
usdCopyBtn.addEventListener('click', copyUsd);
tryCopyBtn.addEventListener('click', copyTry);

tryRateInput.addEventListener('input', (event) => {
    const value = parseUsd(event.target.value);
    if (value <= 0) return;

    manualTryRate = value;
    setStoredItem(STORAGE_KEYS.manualTryRate, manualTryRate.toString());
    syncEffectiveRate();
    updateUI();
});

tryRateInput.addEventListener('blur', () => updateUI());
refreshRateBtn.addEventListener('click', () => fetchExchangeRate(true));
resetRateBtn.addEventListener('click', () => {
    clearManualRate();
    syncEffectiveRate();
    updateUI({ announce: false });

    if (marketRateSource === 'default' || isMarketRateStale()) {
        fetchExchangeRate(true);
    } else {
        showToast('Using the latest available rate');
    }
});

const refreshRateIfNeeded = () => {
    if (marketRateSource === 'default' || isMarketRateStale()) {
        fetchExchangeRate();
    }
};

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        refreshRateIfNeeded();
    }
});
window.addEventListener('online', () => fetchExchangeRate());

initializeTheme();
restoreCachedRate();
restoreManualRate();
syncEffectiveRate();
restoreCalculatorState();
applyEntryMode(entryMode);
restoreTaxCalculator();
setTaxPanelOpen(getStoredItem(STORAGE_KEYS.taxPanelOpen) === 'true');
devexChip.textContent = `1 R$ = $${DEVEX_RATE.toFixed(4)}`;
updateUI({ announce: false });
fetchExchangeRate();
setInterval(fetchExchangeRate, 24 * 60 * 60 * 1000);

if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}
