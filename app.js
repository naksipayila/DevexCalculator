const DEVEX_RATE = 0.0038;
const TAX_RATE = 0.30;
const TAX_MAX_ROBUX = 1_000_000_000;
const STORAGE_KEYS = {
    tryRate: 'tryRate',
    tryRateTimestamp: 'tryRateTimestamp'
};

let robux = '';
let usd = '';
let tryRate = 46.00;


const mainInput = document.getElementById('mainInput');
const clearBtn = document.getElementById('clearBtn');

const tryRateInput = document.getElementById('tryRateInput');
const summaryUsdWrapper = document.getElementById('summaryUsdWrapper');
const summaryUsdInput = document.getElementById('summaryUsdInput');
const summaryTry = document.getElementById('summaryTry');
const summaryTryWrapper = summaryTry.closest('.summary-try-value');
const taxDrawer = document.getElementById('taxDrawer');
const openTaxBtn = document.getElementById('openTaxBtn');
const closeTaxBtn = document.getElementById('closeTaxBtn');
const netRobuxInput = document.getElementById('netRobuxInput');
const grossRobuxInput = document.getElementById('grossRobuxInput');
const taxAmountDisplay = document.getElementById('taxAmountDisplay');

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

const formatNumber = (num) => {
    if (!num) return '';
    const val = parseFloat(num.toString().replace(/\./g, ''));
    if (isNaN(val)) return '';
    return val.toLocaleString('tr-TR');
};

const parseRobux = (value) => {
    const clean = value.toString().replace(/\./g, '').replace(/[^0-9]/g, '');
    return parseFloat(clean) || 0;
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

    return parseFloat(decimalSafe) || 0;
};

const formatUsdInput = (value) => {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const formatTryAmount = (val) => {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);
};

const showToast = (message) => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
};

const clear = () => {
    robux = '';
    usd = '';
};

function updateFromRobux(valStr) {
    if (!valStr) return clear();
    robux = valStr.toString().replace(/[^0-9]/g, '');
    usd = (parseRobux(robux) * DEVEX_RATE).toFixed(2);
}

function updateFromUsd(valStr) {
    if (!valStr) return clear();
    const rawUsd = parseUsd(valStr);

    usd = rawUsd ? rawUsd.toFixed(2) : '';
    robux = rawUsd ? Math.floor(rawUsd / DEVEX_RATE).toString() : '';
}

const updateSummary = (rawUsd, tryDisplay) => {
    if (document.activeElement !== summaryUsdInput) {
        summaryUsdInput.value = formatUsdInput(rawUsd || 0);
    }
    summaryUsdWrapper.classList.toggle('is-zero', !rawUsd);
    summaryTryWrapper.classList.toggle('is-zero', !rawUsd);
    summaryTry.textContent = tryDisplay;
};

const fetchExchangeRate = async () => {
    const cachedRate = getStoredItem(STORAGE_KEYS.tryRate);
    const cachedTimestamp = getStoredItem(STORAGE_KEYS.tryRateTimestamp);
    const oneDay = 24 * 60 * 60 * 1000;

    if (cachedRate && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp, 10) < oneDay)) {
        tryRate = parseFloat(cachedRate);
        updateUI();
        return;
    }

    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');

        if (!response.ok) {
            throw new Error(`Rate service did not respond: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.rates && data.rates.TRY) {
            tryRate = data.rates.TRY;
            setStoredItem(STORAGE_KEYS.tryRate, tryRate.toString());
            setStoredItem(STORAGE_KEYS.tryRateTimestamp, Date.now().toString());
            updateUI();
        }
    } catch (error) {
        console.error('Exchange rate could not be fetched, using the fallback value:', error);

        if (cachedRate) {
            tryRate = parseFloat(cachedRate);
            updateUI();
        }
    }
};

const triggerFlash = () => {
    [summaryUsdWrapper, summaryTry].forEach((el) => {
        if (el) el.classList.add('flash');
    });
    setTimeout(() => {
        [summaryUsdWrapper, summaryTry].forEach((el) => {
            if (el) el.classList.remove('flash');
        });
    }, 400);
};

const updateUI = () => {
    const rawUsd = parseUsd(usd);
    const tryDisplay = formatTryAmount(rawUsd * tryRate);

    mainInput.value = formatNumber(robux);

    updateSummary(rawUsd, tryDisplay);

    if (document.activeElement !== tryRateInput) {
        tryRateInput.value = tryRate.toFixed(2);
    }
};

summaryUsdInput.addEventListener('input', (e) => {
    updateFromUsd(e.target.value);
    updateUI();
});

const startUsdEditing = () => {
    summaryUsdInput.value = '';
};

summaryUsdInput.addEventListener('click', startUsdEditing);

summaryUsdInput.addEventListener('blur', () => {
    updateUI();
});

mainInput.addEventListener('input', (e) => {
    updateFromRobux(e.target.value);
    updateUI();
});

mainInput.addEventListener('click', () => {
    mainInput.value = '';
});

const handleClear = () => {
    mainInput.blur();
    summaryUsdInput.blur();
    clear();
    triggerFlash();
    updateUI();
};

clearBtn.addEventListener('click', handleClear);

tryRateInput.addEventListener('input', (e) => {
    const val = parseUsd(e.target.value);
    if (val > 0) {
        tryRate = val;
        setStoredItem(STORAGE_KEYS.tryRate, tryRate.toString());
        setStoredItem(STORAGE_KEYS.tryRateTimestamp, Date.now().toString());

        const rawUsd = parseUsd(usd);
        const tryDisplay = formatTryAmount(rawUsd * tryRate);
        updateSummary(rawUsd, tryDisplay);
    }
});

tryRateInput.addEventListener('blur', () => {
    updateUI();
});

openTaxBtn.addEventListener('click', () => {
    taxDrawer.classList.add('open');
    netRobuxInput.value = '';
    grossRobuxInput.value = '';
    taxAmountDisplay.textContent = '0 R$';
});

const closeDrawer = () => {
    taxDrawer.classList.remove('open');
};

closeTaxBtn.addEventListener('click', closeDrawer);
taxDrawer.addEventListener('click', (e) => {
    if (e.target === taxDrawer) {
        closeDrawer();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (taxDrawer.classList.contains('open')) {
            closeDrawer();
        }
    }
});

const calculateFromNet = (netVal) => {
    const net = Math.min(parseFloat(netVal) || 0, TAX_MAX_ROBUX);
    const gross = Math.floor(net / (1 - TAX_RATE));
    const tax = gross - net;

    grossRobuxInput.value = formatNumber(gross);
    taxAmountDisplay.textContent = `${formatNumber(tax)} R$`;
};

const normalizeTaxInput = (value) => {
    const clean = value.toString().replace(/[^0-9]/g, '');
    return Math.min(parseInt(clean, 10) || 0, TAX_MAX_ROBUX);
};

const allowTaxInputKey = (e) => {
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab', 'Enter'];
    if (e.ctrlKey || e.metaKey || e.altKey || controlKeys.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
};

netRobuxInput.addEventListener('keydown', allowTaxInputKey);

netRobuxInput.addEventListener('input', (e) => {
    const value = normalizeTaxInput(e.target.value);
    e.target.value = formatNumber(value);
    calculateFromNet(value);
});

document.getElementById('grossCopyBtn').addEventListener('click', () => {
    const text = grossRobuxInput.value;
    if (text && text !== '0') {
        navigator.clipboard.writeText(text.replace(/\./g, '')).then(() => {
            showToast('Gross Robux copied');
        }).catch(() => {});
    }
});

summaryUsdWrapper.addEventListener('pointerdown', (e) => {
    startUsdEditing();
    if (e.target !== summaryUsdInput) {
        e.preventDefault();
        summaryUsdInput.focus();
        summaryUsdInput.select();
    }
});

updateUI();
fetchExchangeRate();
setInterval(fetchExchangeRate, 24 * 60 * 60 * 1000);

if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}
