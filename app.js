const DEVEX_RATE = 0.0038;
const DEVEX_MIN_ROBUX = 30_000;
const TAX_RATE = 0.30;
const TAX_MAX_ROBUX = 1_000_000_000;
const MAX_MAIN_ROBUX_DIGITS = 15;
const DESKTOP_QUERY = window.matchMedia('(min-width: 901px)');
const STORAGE_KEYS = {
    tryRate: 'tryRate',
    tryRateTimestamp: 'tryRateTimestamp',
    theme: 'theme'
};

let robux = '';
let usd = '';
let tryRate = 46.00;
let rateSource = 'default';
let rateUpdatedAt = null;
let lastDrawerTrigger = null;
let toastTimer = null;
let announceTimer = null;
let isRateRequestInFlight = false;

const root = document.documentElement;
const metaThemeColor = document.getElementById('metaThemeColor');
const themeToggle = document.getElementById('themeToggle');
const mainInput = document.getElementById('mainInput');
const clearBtn = document.getElementById('clearBtn');
const thresholdHint = document.getElementById('thresholdHint');
const devexChip = document.getElementById('devexChip');
const tryRateInput = document.getElementById('tryRateInput');
const refreshRateBtn = document.getElementById('refreshRateBtn');
const rateDot = document.getElementById('rateDot');
const rateStatusText = document.getElementById('rateStatusText');
const summaryUsdWrapper = document.getElementById('summaryUsdWrapper');
const summaryUsdInput = document.getElementById('summaryUsdInput');
const usdCopyBtn = document.getElementById('usdCopyBtn');
const summaryTry = document.getElementById('summaryTry');
const summaryTryWrapper = document.getElementById('summaryTryWrapper');
const tryCopyBtn = document.getElementById('tryCopyBtn');
const taxDrawer = document.getElementById('taxDrawer');
const taxContent = document.getElementById('taxContent');
const openTaxBtn = document.getElementById('openTaxBtn');
const closeTaxBtn = document.getElementById('closeTaxBtn');
const netRobuxInput = document.getElementById('netRobuxInput');
const grossRobuxInput = document.getElementById('grossRobuxInput');
const grossCopyBtn = document.getElementById('grossCopyBtn');
const taxAmountDisplay = document.getElementById('taxAmountDisplay');
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

const formatNumber = (value) => {
    if (value === '' || value === null || value === undefined) return '';

    const digits = value.toString().replace(/\D/g, '');
    if (!digits) return '';

    return Number(digits).toLocaleString('tr-TR');
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

const formatUsdInput = (value) => value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const formatTryAmount = (value) => new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format(value);

const getTimeLabel = (timestamp) => {
    if (!timestamp) return null;

    return new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp));
};

const syncUsdInputSize = () => {
    const size = Math.max(4, Math.min(summaryUsdInput.value.length || 5, 18));
    summaryUsdInput.size = size;
};

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

    const message = `Robux ${formatNumber(robux)}. USD ${formatUsdInput(rawUsd)}. TRY ${tryDisplay}.`;
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

const clear = () => {
    robux = '';
    usd = '';
};

function updateFromRobux(value) {
    robux = value.toString().replace(/\D/g, '').slice(0, MAX_MAIN_ROBUX_DIGITS);
    usd = robux ? (parseRobux(robux) * DEVEX_RATE).toFixed(2) : '';
}

function updateFromUsd(value) {
    if (!value || !value.toString().trim()) {
        clear();
        return;
    }

    const rawUsd = parseUsd(value);
    usd = rawUsd ? rawUsd.toFixed(2) : '';
    robux = rawUsd ? Math.floor(rawUsd / DEVEX_RATE).toString() : '';
}

const updateSummary = (rawUsd, tryDisplay) => {
    if (document.activeElement !== summaryUsdInput) {
        summaryUsdInput.value = formatUsdInput(rawUsd);
    }

    syncUsdInputSize();
    summaryUsdWrapper.classList.toggle('is-zero', !rawUsd);
    summaryTryWrapper.classList.toggle('is-zero', !rawUsd);
    summaryTry.textContent = tryDisplay;
};

const updateThresholdHint = () => {
    const robuxValue = parseRobux(robux);
    const shouldShowHint = robuxValue > 0 && robuxValue < DEVEX_MIN_ROBUX;

    thresholdHint.hidden = !shouldShowHint;
    if (shouldShowHint) {
        thresholdHint.textContent = `Below DevEx minimum (${formatNumber(DEVEX_MIN_ROBUX)} R$)`;
    }
};

const renderRateStatus = () => {
    const statusClasses = ['is-live', 'is-cache', 'is-manual', 'is-default'];
    rateDot.classList.remove(...statusClasses);
    rateDot.classList.add(`is-${rateSource}`);

    if (isRateRequestInFlight) {
        rateStatusText.textContent = 'Checking live rate';
        return;
    }

    const timeLabel = getTimeLabel(rateUpdatedAt);

    if (rateSource === 'live') {
        rateStatusText.textContent = timeLabel ? `Updated ${timeLabel}` : 'Live rate';
    } else if (rateSource === 'cache') {
        rateStatusText.textContent = timeLabel ? `Cached ${timeLabel}` : 'Cached rate';
    } else if (rateSource === 'manual') {
        rateStatusText.textContent = 'Manual rate';
    } else {
        rateStatusText.textContent = 'Offline - default rate';
    }
};

const updateUI = ({ announce = true } = {}) => {
    const rawUsd = parseUsd(usd);
    const tryDisplay = formatTryAmount(rawUsd * tryRate);

    if (document.activeElement !== mainInput) {
        mainInput.value = formatNumber(robux);
    }

    updateSummary(rawUsd, tryDisplay);

    if (document.activeElement !== tryRateInput) {
        tryRateInput.value = tryRate.toFixed(2);
    }

    clearBtn.hidden = !robux && !usd;
    updateThresholdHint();
    renderRateStatus();

    if (announce) {
        queueAnnouncement(rawUsd, tryDisplay);
    }
};

const triggerFlash = () => {
    [summaryUsdWrapper, summaryTryWrapper].forEach((element) => element.classList.add('flash'));
    setTimeout(() => {
        [summaryUsdWrapper, summaryTryWrapper].forEach((element) => element.classList.remove('flash'));
    }, 400);
};

const restoreCachedRate = () => {
    const cachedRate = Number.parseFloat(getStoredItem(STORAGE_KEYS.tryRate));
    if (!Number.isFinite(cachedRate) || cachedRate <= 0) return;

    tryRate = cachedRate;
    rateSource = 'cache';
    const timestamp = Number.parseInt(getStoredItem(STORAGE_KEYS.tryRateTimestamp), 10);
    rateUpdatedAt = Number.isFinite(timestamp) ? timestamp : null;
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

        tryRate = liveRate;
        rateSource = 'live';
        rateUpdatedAt = Date.now();
        setStoredItem(STORAGE_KEYS.tryRate, tryRate.toString());
        setStoredItem(STORAGE_KEYS.tryRateTimestamp, rateUpdatedAt.toString());
        updateUI({ announce: false });

        if (userInitiated) {
            showToast('Live rate updated');
        }
    } catch (error) {
        console.error('Exchange rate could not be fetched:', error);

        if (rateSource !== 'manual') {
            restoreCachedRate();
        }

        updateUI({ announce: false });

        if (userInitiated) {
            showToast(rateSource === 'cache' ? 'Using cached rate' : 'Rate could not be updated');
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

const resetTaxCalculator = () => {
    netRobuxInput.value = '';
    grossRobuxInput.value = '0';
    taxAmountDisplay.textContent = '0 R$';
};

const syncDrawerMode = () => {
    if (DESKTOP_QUERY.matches) {
        taxDrawer.classList.remove('open');
        taxDrawer.setAttribute('aria-hidden', 'false');
        taxContent.removeAttribute('inert');
        taxContent.setAttribute('role', 'region');
        taxContent.removeAttribute('aria-modal');
        return;
    }

    const isOpen = taxDrawer.classList.contains('open');
    taxDrawer.setAttribute('aria-hidden', String(!isOpen));
    taxContent.setAttribute('role', 'dialog');
    taxContent.setAttribute('aria-modal', 'true');

    if (isOpen) {
        taxContent.removeAttribute('inert');
    } else {
        taxContent.setAttribute('inert', '');
    }
};

const openDrawer = () => {
    if (DESKTOP_QUERY.matches) return;

    lastDrawerTrigger = document.activeElement;
    resetTaxCalculator();
    taxDrawer.classList.add('open');
    syncDrawerMode();

    requestAnimationFrame(() => netRobuxInput.focus());
};

const closeDrawer = () => {
    if (DESKTOP_QUERY.matches || !taxDrawer.classList.contains('open')) return;

    taxDrawer.classList.remove('open');
    syncDrawerMode();

    if (lastDrawerTrigger instanceof HTMLElement && document.contains(lastDrawerTrigger)) {
        lastDrawerTrigger.focus();
    }

    lastDrawerTrigger = null;
};

const trapDrawerFocus = (event) => {
    if (event.key !== 'Tab' || DESKTOP_QUERY.matches || !taxDrawer.classList.contains('open')) return;

    const focusableElements = Array.from(taxContent.querySelectorAll(
        'button:not([disabled]), input:not([disabled]):not([readonly]), [tabindex]:not([tabindex="-1"])'
    ));

    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && (document.activeElement === firstElement || !taxContent.contains(document.activeElement))) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
};

const calculateFromNet = (value) => {
    const net = Math.min(parseRobux(value), TAX_MAX_ROBUX);
    const gross = Math.floor(net / (1 - TAX_RATE));
    const tax = gross - net;

    grossRobuxInput.value = formatNumber(gross);
    taxAmountDisplay.textContent = `${formatNumber(tax)} R$`;
};

const normalizeTaxInput = (value) => Math.min(parseRobux(value), TAX_MAX_ROBUX);

const allowTaxInputKey = (event) => {
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab', 'Enter'];
    if (event.ctrlKey || event.metaKey || event.altKey || controlKeys.includes(event.key)) return;
    if (!/^\d$/.test(event.key)) event.preventDefault();
};

themeToggle.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
});

mainInput.addEventListener('focus', () => mainInput.select());
mainInput.addEventListener('input', (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, MAX_MAIN_ROBUX_DIGITS);
    setFormattedValueKeepingCaret(event.target, formatNumber(digits));
    updateFromRobux(digits);
    updateUI();
});

summaryUsdInput.addEventListener('focus', () => summaryUsdInput.select());
summaryUsdInput.addEventListener('input', (event) => {
    updateFromUsd(event.target.value);
    updateUI();
});

summaryUsdInput.addEventListener('blur', () => updateUI());
summaryUsdWrapper.addEventListener('pointerdown', (event) => {
    if (event.target === summaryUsdInput || event.target.closest('button')) return;

    event.preventDefault();
    summaryUsdInput.focus();
    summaryUsdInput.select();
});

clearBtn.addEventListener('click', () => {
    mainInput.blur();
    summaryUsdInput.blur();
    clear();
    triggerFlash();
    updateUI();
});

document.querySelectorAll('.amount-chip').forEach((button) => {
    button.addEventListener('click', () => {
        updateFromRobux(button.dataset.robux || '');
        mainInput.value = formatNumber(robux);
        updateUI();
    });
});

tryRateInput.addEventListener('input', (event) => {
    const value = parseUsd(event.target.value);
    if (value <= 0) return;

    tryRate = value;
    rateSource = 'manual';
    rateUpdatedAt = Date.now();
    setStoredItem(STORAGE_KEYS.tryRate, tryRate.toString());
    setStoredItem(STORAGE_KEYS.tryRateTimestamp, rateUpdatedAt.toString());
    updateUI();
});

tryRateInput.addEventListener('blur', () => updateUI());
refreshRateBtn.addEventListener('click', () => fetchExchangeRate(true));

usdCopyBtn.addEventListener('click', copyUsd);
tryCopyBtn.addEventListener('click', copyTry);

openTaxBtn.addEventListener('click', openDrawer);
closeTaxBtn.addEventListener('click', closeDrawer);
taxDrawer.addEventListener('click', (event) => {
    if (!DESKTOP_QUERY.matches && event.target === taxDrawer) {
        closeDrawer();
    }
});
taxDrawer.addEventListener('keydown', trapDrawerFocus);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeDrawer();
    }
});

netRobuxInput.addEventListener('keydown', allowTaxInputKey);
netRobuxInput.addEventListener('input', (event) => {
    const digits = event.target.value.replace(/\D/g, '');
    const value = normalizeTaxInput(digits);
    setFormattedValueKeepingCaret(event.target, digits ? formatNumber(value) : '');
    calculateFromNet(value);
});

grossCopyBtn.addEventListener('click', async () => {
    const gross = parseRobux(grossRobuxInput.value);
    if (!gross) return;

    if (await copyText(gross.toString())) {
        showToast('Gross Robux copied');
    }
});

DESKTOP_QUERY.addEventListener('change', syncDrawerMode);

initializeTheme();
restoreCachedRate();
devexChip.textContent = `1 R$ = $${DEVEX_RATE.toFixed(4)}`;
syncDrawerMode();
updateUI({ announce: false });
fetchExchangeRate();
setInterval(fetchExchangeRate, 24 * 60 * 60 * 1000);

if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}
