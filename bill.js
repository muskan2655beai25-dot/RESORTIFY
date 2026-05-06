// ═══════════════════════════════════════════════════════════════
//  RESORTIFY — RESERVATION FOLIO  |  bill.js  (Advanced Edition)
// ═══════════════════════════════════════════════════════════════

// ── CONFIG & STATE ──────────────────────────────────────────────
const config = {
    basePrice: 240,
    guestSurcharge: 50,
    taxRate: 0.12,
    promoDiscount: 0.05
};

// Full application state — single source of truth
const state = {
    nights: 3,
    guests: 2,
    checkin: '2026-10-24',
    currency: 'USD',
    promoApplied: true,
    promoCode: 'LUXESCAPE',
    addons: {},           // { key: boolean }
    history: [],          // undo/redo stack
    historyIndex: -1,
    saved: false,
    locked: false         // true after "Proceed to Payment" clicked
};

// Available currency conversions
const currencies = {
    USD: { symbol: '$', rate: 1, name: 'US Dollar' },
    INR: { symbol: '₹', rate: 83.50, name: 'Indian Rupee' },
    EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
    AED: { symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' }
};

// Optional add-ons catalogue
const addOnsCatalogue = [
    { key: 'spa', label: 'Spa Day Pass', price: 120, icon: 'fa-spa' },
    { key: 'transfer', label: 'Airport Transfer', price: 60, icon: 'fa-car-side' },
    { key: 'breakfast', label: 'Breakfast for 2', price: 45, icon: 'fa-mug-hot' },
    { key: 'latecheck', label: 'Late Check-Out (4 PM)', price: 80, icon: 'fa-clock' }
];

// ── UTILITY HELPERS ─────────────────────────────────────────────
function fmt(amount) {
    const { symbol, rate } = currencies[state.currency];
    return symbol + (amount * rate).toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function pushHistory() {
    // Trim any future states if we've gone back in time
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(JSON.stringify({ nights: state.nights, guests: state.guests, addons: state.addons, promoApplied: state.promoApplied }));
    state.historyIndex = state.history.length - 1;
    updateUndoRedoUI();
}

function updateUndoRedoUI() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = state.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = state.historyIndex >= state.history.length - 1;
}

function showToast(msg, type = 'info') {
    let tc = document.getElementById('bill-toasts');
    if (!tc) {
        tc = document.createElement('div');
        tc.id = 'bill-toasts';
        tc.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:99999;display:flex;flex-direction:column;gap:10px;align-items:flex-end;';
        document.body.appendChild(tc);
    }
    const colors = { info: '#b2905a', success: '#27ae60', error: '#e74c3c', warn: '#e67e22' };
    const t = document.createElement('div');
    t.style.cssText = `background:#1a1a1a;color:#fff;padding:14px 20px;font-size:12px;
        letter-spacing:.8px;border-left:3px solid ${colors[type]};box-shadow:0 8px 30px rgba(0,0,0,.25);
        opacity:0;transform:translateX(20px);font-family:'Inter',sans-serif;max-width:280px;`;
    t.textContent = msg;
    tc.appendChild(t);
    t.animate([{ opacity: 0, transform: 'translateX(20px)' }, { opacity: 1, transform: 'translateX(0)' }],
        { duration: 300, fill: 'forwards' });
    setTimeout(() => {
        t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' })
            .onfinish = () => t.remove();
    }, 3200);
}

// ── CALCULATION ENGINE ──────────────────────────────────────────
function calcBill() {
    let accommodation = config.basePrice * state.nights;
    if (state.guests > 2) accommodation += (state.guests - 2) * config.guestSurcharge * state.nights;

    let addonsTotal = 0;
    addOnsCatalogue.forEach(a => { if (state.addons[a.key]) addonsTotal += a.price; });

    const subtotal = accommodation + addonsTotal;
    const taxes = subtotal * config.taxRate;
    const discount = state.promoApplied ? accommodation * config.promoDiscount : 0;
    const grand = subtotal + taxes - discount;

    return { accommodation, addonsTotal, subtotal, taxes, discount, grand };
}

// ── ANIMATED COUNTER ────────────────────────────────────────────
function animateValue(el, from, to, duration = 600) {
    if (!el) return;
    const { rate } = currencies[state.currency];
    const { symbol } = currencies[state.currency];
    let start = null;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const v = from + (to - from) * ease(p);
        el.textContent = symbol + (v * rate).toLocaleString(undefined, { minimumFractionDigits: 2 });
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// ── RENDER BILL TABLE ────────────────────────────────────────────
function renderTable(animate = true) {
    const b = calcBill();
    const tbody = document.querySelector('.bill-table tbody');
    if (!tbody) return;

    let rows = `
        <tr class="${animate ? 'row-reveal' : ''}">
            <td>Accommodation<br><small>${state.nights} Night${state.nights !== 1 ? 's' : ''} · ${state.guests} Guest${state.guests !== 1 ? 's' : ''} · ${fmt(config.basePrice)}/night</small></td>
            <td class="text-right">${fmt(b.accommodation)}</td>
        </tr>`;

    // Active add-ons
    addOnsCatalogue.forEach(a => {
        if (state.addons[a.key]) {
            rows += `<tr class="${animate ? 'row-reveal' : ''}">
                <td><i class="fa-solid ${a.icon}" style="color:var(--gold);margin-right:8px;"></i>${a.label}</td>
                <td class="text-right">${fmt(a.price)}</td>
            </tr>`;
        }
    });

    rows += `
        <tr class="${animate ? 'row-reveal' : ''}">
            <td>Taxes & Fees<br><small>VAT ${(config.taxRate * 100).toFixed(0)}% + Tourism Fee</small></td>
            <td class="text-right">${fmt(b.taxes)}</td>
        </tr>`;

    if (b.discount > 0) {
        rows += `<tr class="discount-row ${animate ? 'row-reveal' : ''}">
            <td>Seasonal Promo <i class="fa-solid fa-tag" style="font-size:10px;margin-left:4px;"></i><br><small>Code: ${state.promoCode} (-${(config.promoDiscount * 100).toFixed(0)}%)</small></td>
            <td class="text-right">-${fmt(b.discount)}</td>
        </tr>`;
    }

    tbody.innerHTML = rows;

    // Staggered row entrance
    if (animate) {
        tbody.querySelectorAll('.row-reveal').forEach((row, i) => {
            row.style.cssText = 'opacity:0;transform:translateX(-12px);transition:opacity 0.4s ease,transform 0.4s ease;';
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, 80 * i);
        });
    }

    // Animate grand total
    const totalEl = document.querySelector('.total-amount');
    const prev = parseFloat((totalEl?.dataset.raw) || '0');
    if (totalEl) {
        totalEl.dataset.raw = b.grand;
        animateValue(totalEl, prev, b.grand);
    }

    // Update breakdown bar
    updateBreakdownBar(b);

    // Save draft to sessionStorage
    saveDraft();
}

// ── VISUAL BREAKDOWN BAR ─────────────────────────────────────────
function updateBreakdownBar(b) {
    const bar = document.getElementById('breakdown-bar');
    if (!bar) return;
    const total = b.grand;
    const segments = [
        { label: 'Room', value: b.accommodation, color: '#b2905a' },
        { label: 'Add-ons', value: b.addonsTotal, color: '#d4af7a' },
        { label: 'Tax', value: b.taxes, color: '#888' },
        { label: 'Discount', value: -b.discount, color: '#27ae60' }
    ];
    bar.innerHTML = segments.filter(s => s.value !== 0).map(s => {
        const pct = Math.abs(s.value / total * 100).toFixed(1);
        return `<div class="bar-seg" data-tip="${s.label}: ${fmt(Math.abs(s.value))}"
                    style="width:${pct}%;background:${s.color};height:100%;transition:width 0.5s ease;position:relative;"
                    title="${s.label}: ${fmt(Math.abs(s.value))} (${pct}%)"></div>`;
    }).join('');
}

// ── PROMO CODE ENGINE ────────────────────────────────────────────
const validCodes = {
    'LUXESCAPE': 0.05,
    'FLASH20': 0.20,
    'WELCOME10': 0.10
};

function initPromoSection() {
    const container = document.querySelector('.bill-body');
    if (!container) return;

    const promoDiv = document.createElement('div');
    promoDiv.id = 'promo-section';
    promoDiv.style.cssText = 'margin:20px 0;display:flex;gap:10px;align-items:center;';
    promoDiv.innerHTML = `
        <input id="promo-input" placeholder="Enter promo code" style="
            flex:1;border:1px solid #ddd;padding:12px 16px;font-size:12px;letter-spacing:1px;
            font-family:'Inter',sans-serif;outline:none;transition:border-color .3s;text-transform:uppercase;
        ">
        <button id="promo-apply" style="
            background:var(--dark);color:#fff;border:none;padding:12px 20px;font-size:10px;
            font-weight:700;letter-spacing:2px;cursor:pointer;transition:background .3s;white-space:nowrap;
        ">APPLY CODE</button>
        <button id="promo-remove" style="
            display:${state.promoApplied ? 'flex' : 'none'};background:transparent;border:1px solid #ddd;
            padding:12px;cursor:pointer;color:#999;font-size:13px;align-items:center;
        "><i class="fa-solid fa-xmark"></i></button>
    `;
    container.querySelector('hr.divider')?.after(promoDiv);

    document.getElementById('promo-input').value = state.promoCode;

    document.getElementById('promo-apply').addEventListener('click', () => {
        const code = document.getElementById('promo-input').value.trim().toUpperCase();
        if (validCodes[code]) {
            config.promoDiscount = validCodes[code];
            state.promoCode = code;
            state.promoApplied = true;
            document.getElementById('promo-remove').style.display = 'flex';
            showToast(`Code "${code}" applied — ${(validCodes[code] * 100).toFixed(0)}% off!`, 'success');
            pushHistory();
            renderTable();
        } else {
            showToast('Invalid promo code. Try FLASH20 or WELCOME10.', 'error');
            document.getElementById('promo-input').animate([
                { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' },
                { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }
            ], { duration: 300 });
        }
    });

    document.getElementById('promo-remove').addEventListener('click', () => {
        state.promoApplied = false;
        state.promoCode = '';
        document.getElementById('promo-input').value = '';
        document.getElementById('promo-remove').style.display = 'none';
        showToast('Promo code removed.', 'warn');
        pushHistory();
        renderTable();
    });
}

// ── ADD-ONS UI ───────────────────────────────────────────────────
function initAddOns() {
    const container = document.querySelector('.bill-body');
    if (!container || document.getElementById('addons-section')) return;

    const sec = document.createElement('div');
    sec.id = 'addons-section';
    sec.innerHTML = `
        <div style="margin:30px 0 15px;font-size:10px;letter-spacing:2px;color:var(--gold);font-weight:700;">ENHANCE YOUR STAY</div>
        <div id="addons-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;"></div>
    `;
    container.querySelector('.bill-table')?.before(sec);

    const grid = document.getElementById('addons-grid');
    addOnsCatalogue.forEach(a => {
        const card = document.createElement('div');
        card.className = 'addon-card';
        card.dataset.key = a.key;
        card.style.cssText = `
            border:1px solid #eee;padding:16px;cursor:pointer;transition:all .25s ease;
            display:flex;align-items:center;gap:12px;user-select:none;
            ${state.addons[a.key] ? 'border-color:var(--gold);background:#fdf9f4;' : ''}
        `;
        card.innerHTML = `
            <i class="fa-solid ${a.icon}" style="color:${state.addons[a.key] ? 'var(--gold)' : '#bbb'};font-size:18px;width:22px;text-align:center;"></i>
            <div style="flex:1;">
                <div style="font-size:12px;font-weight:600;color:var(--dark);">${a.label}</div>
                <div style="font-size:11px;color:#999;margin-top:2px;">+${fmt(a.price)}</div>
            </div>
            <div class="addon-check" style="width:18px;height:18px;border-radius:50%;border:1.5px solid ${state.addons[a.key] ? 'var(--gold)' : '#ddd'};
                display:flex;align-items:center;justify-content:center;font-size:9px;
                background:${state.addons[a.key] ? 'var(--gold)' : 'transparent'};color:#fff;">
                ${state.addons[a.key] ? '<i class="fa-solid fa-check"></i>' : ''}
            </div>
        `;

        card.addEventListener('click', () => {
            if (state.locked) return;
            state.addons[a.key] = !state.addons[a.key];
            const isOn = state.addons[a.key];

            card.style.borderColor = isOn ? 'var(--gold)' : '#eee';
            card.style.background = isOn ? '#fdf9f4' : '';
            card.querySelector('i').style.color = isOn ? 'var(--gold)' : '#bbb';
            const check = card.querySelector('.addon-check');
            check.style.background = isOn ? 'var(--gold)' : 'transparent';
            check.style.borderColor = isOn ? 'var(--gold)' : '#ddd';
            check.innerHTML = isOn ? '<i class="fa-solid fa-check"></i>' : '';

            card.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
                { duration: 250 });

            showToast(isOn ? `${a.label} added to your stay.` : `${a.label} removed.`, isOn ? 'success' : 'info');
            pushHistory();
            renderTable();
        });

        grid.appendChild(card);
    });
}

// ── CURRENCY SELECTOR ─────────────────────────────────────────────
function initCurrencySelector() {
    const totalBox = document.querySelector('.total-box');
    if (!totalBox || document.getElementById('currency-select')) return;

    const sel = document.createElement('select');
    sel.id = 'currency-select';
    sel.style.cssText = `
        background:transparent;border:1px solid rgba(178,144,90,.4);color:#b2905a;
        font-size:10px;letter-spacing:1px;padding:6px 10px;cursor:pointer;
        font-family:'Inter',sans-serif;font-weight:700;margin-top:8px;outline:none;
    `;
    Object.entries(currencies).forEach(([code, { name }]) => {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = `${code} — ${name}`;
        if (code === state.currency) opt.selected = true;
        sel.appendChild(opt);
    });

    const labelDiv = totalBox.querySelector('.total-label');
    labelDiv.after(sel);

    sel.addEventListener('change', () => {
        state.currency = sel.value;
        renderTable(false);
        showToast(`Currency changed to ${currencies[state.currency].name}`, 'info');
        // Also refresh addons price labels
        document.querySelectorAll('.addon-card').forEach(card => {
            const key = card.dataset.key;
            const a = addOnsCatalogue.find(x => x.key === key);
            if (a) card.querySelector('[style*="color:#999"]').textContent = `+${fmt(a.price)}`;
        });
    });
}

// ── UNDO / REDO TOOLBAR ──────────────────────────────────────────
function initUndoRedo() {
    const footer = document.querySelector('.bill-footer');
    if (!footer || document.getElementById('undo-btn')) return;

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;';
    toolbar.innerHTML = `
        <button id="undo-btn" title="Undo last change" disabled style="
            background:transparent;border:1px solid #ddd;padding:8px 14px;cursor:pointer;
            font-size:11px;color:#999;letter-spacing:1px;transition:.2s;display:flex;align-items:center;gap:6px;
        "><i class="fa-solid fa-rotate-left"></i> UNDO</button>
        <button id="redo-btn" title="Redo" disabled style="
            background:transparent;border:1px solid #ddd;padding:8px 14px;cursor:pointer;
            font-size:11px;color:#999;letter-spacing:1px;transition:.2s;display:flex;align-items:center;gap:6px;
        "><i class="fa-solid fa-rotate-right"></i> REDO</button>
        <div style="flex:1;"></div>
        <button id="save-btn" title="Save draft" style="
            background:transparent;border:1px solid #ddd;padding:8px 14px;cursor:pointer;
            font-size:11px;color:#999;letter-spacing:1px;transition:.2s;display:flex;align-items:center;gap:6px;
        "><i class="fa-regular fa-bookmark"></i> SAVE DRAFT</button>
    `;
    footer.before(toolbar);

    document.getElementById('undo-btn').addEventListener('click', () => {
        if (state.historyIndex <= 0) return;
        state.historyIndex--;
        restoreSnapshot(JSON.parse(state.history[state.historyIndex]));
        updateUndoRedoUI();
    });

    document.getElementById('redo-btn').addEventListener('click', () => {
        if (state.historyIndex >= state.history.length - 1) return;
        state.historyIndex++;
        restoreSnapshot(JSON.parse(state.history[state.historyIndex]));
        updateUndoRedoUI();
    });

    document.getElementById('save-btn').addEventListener('click', () => {
        saveDraft(true);
        const btn = document.getElementById('save-btn');
        btn.innerHTML = '<i class="fa-solid fa-bookmark"></i> SAVED';
        btn.style.color = 'var(--gold)';
        btn.style.borderColor = 'var(--gold)';
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-regular fa-bookmark"></i> SAVE DRAFT';
            btn.style.color = '#999';
            btn.style.borderColor = '#ddd';
        }, 2000);
    });
}

function restoreSnapshot(snap) {
    state.nights = snap.nights;
    state.guests = snap.guests;
    state.addons = { ...snap.addons };
    state.promoApplied = snap.promoApplied;

    const nightsEl = document.getElementById('stay-nights');
    const guestsEl = document.getElementById('guest-count');
    if (nightsEl) nightsEl.value = state.nights;
    if (guestsEl) guestsEl.value = state.guests;

    // Sync addon cards
    document.querySelectorAll('.addon-card').forEach(card => {
        const key = card.dataset.key;
        const isOn = !!state.addons[key];
        card.style.borderColor = isOn ? 'var(--gold)' : '#eee';
        card.style.background = isOn ? '#fdf9f4' : '';
        card.querySelector('i').style.color = isOn ? 'var(--gold)' : '#bbb';
        const check = card.querySelector('.addon-check');
        check.style.background = isOn ? 'var(--gold)' : 'transparent';
        check.style.borderColor = isOn ? 'var(--gold)' : '#ddd';
        check.innerHTML = isOn ? '<i class="fa-solid fa-check"></i>' : '';
    });

    renderTable();
}

// ── SESSION PERSISTENCE ──────────────────────────────────────────
function saveDraft(manual = false) {
    const draft = {
        nights: state.nights,
        guests: state.guests,
        checkin: state.checkin,
        currency: state.currency,
        addons: state.addons,
        promoApplied: state.promoApplied,
        promoCode: state.promoCode
    };
    sessionStorage.setItem('resortify_draft', JSON.stringify(draft));
    if (manual) showToast('Draft saved. Your changes are preserved.', 'success');
}

function loadDraft() {
    const raw = sessionStorage.getItem('resortify_draft');
    if (!raw) return false;
    try {
        const d = JSON.parse(raw);
        Object.assign(state, d);
        return true;
    } catch { return false; }
}

// ── CHECKOUT CONFIRMATION FLOW ───────────────────────────────────
function initCheckoutButton() {
    const btn = document.querySelector('.btn-confirm');
    if (!btn) return;

    btn.addEventListener('click', function () {
        if (state.locked) return;
        state.locked = true;

        // Phase 1 — encrypting
        btn.innerHTML = `<i class="fa-solid fa-lock"></i>&nbsp; SECURING CONNECTION…`;
        btn.style.background = '#b2905a';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; PROCESSING…`;
        }, 1200);

        setTimeout(() => {
            btn.innerHTML = `<i class="fa-solid fa-check-circle"></i>&nbsp; CONFIRMED — REDIRECTING`;
            btn.style.background = '#27ae60';
            showToast('Reservation confirmed! Redirecting to payment gateway…', 'success');

            // Show summary overlay
            showConfirmOverlay();
        }, 2800);
    });
}

function showConfirmOverlay() {
    const b = calcBill();
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;
        display:flex;align-items:center;justify-content:center;
        backdrop-filter:blur(8px);padding:20px;
    `;
    overlay.innerHTML = `
        <div style="background:#fff;max-width:480px;width:100%;padding:50px 40px;text-align:center;box-shadow:0 40px 80px rgba(0,0,0,.4);">
            <div style="width:60px;height:60px;border-radius:50%;background:#27ae60;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
                <i class="fa-solid fa-check" style="color:#fff;font-size:24px;"></i>
            </div>
            <div style="font-size:10px;letter-spacing:3px;color:var(--gold);font-weight:700;margin-bottom:10px;">BOOKING CONFIRMED</div>
            <h2 style="font-family:'Playfair Display',serif;font-size:28px;font-weight:400;margin-bottom:8px;">Your Stay is Reserved</h2>
            <p style="color:#999;font-size:13px;line-height:1.7;margin-bottom:30px;">
                ${state.nights} night${state.nights !== 1 ? 's' : ''} · ${state.guests} guest${state.guests !== 1 ? 's' : ''}<br>
                Check-in: <strong>${state.checkin}</strong>
            </p>
            <div style="background:#f9f9f9;padding:20px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:11px;letter-spacing:1px;color:#999;">TOTAL CHARGED</span>
                <span style="font-family:'Playfair Display',serif;font-size:26px;color:var(--gold);">${fmt(b.grand)}</span>
            </div>
            <p style="font-size:11px;color:#ccc;letter-spacing:.5px;">Ref #RES-${Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
}

// ── LIVE DATE → CHECKOUT AUTO-CALCULATE ──────────────────────────
function initDateLogic() {
    const checkinEl = document.getElementById('checkin-date');
    const nightsEl = document.getElementById('stay-nights');
    if (!checkinEl || !nightsEl) return;

    // Inject a computed checkout display
    const checkoutRow = document.createElement('div');
    checkoutRow.className = 'info-item';
    checkoutRow.id = 'checkout-display';
    checkoutRow.innerHTML = `<span>CHECK-OUT</span><p id="checkout-val">—</p>`;
    checkinEl.closest('.info-grid').appendChild(checkoutRow);

    const updateCheckout = () => {
        const ci = new Date(checkinEl.value);
        const n = parseInt(nightsEl.value) || 1;
        ci.setDate(ci.getDate() + n);
        document.getElementById('checkout-val').textContent =
            ci.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    checkinEl.addEventListener('change', () => { state.checkin = checkinEl.value; updateCheckout(); });
    nightsEl.addEventListener('change', updateCheckout);
    updateCheckout();
}

// ── SCROLL-REVEAL (INTERSECTION OBSERVER) ────────────────────────
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = `${i * 0.08}s`;
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.info-item, .bill-table tr, .total-box, #addons-section, #promo-section')
        .forEach(el => {
            el.classList.add('hidden-state');
            observer.observe(el);
        });
}

// ── LIVE INPUT HANDLERS ───────────────────────────────────────────
function initInputHandlers() {
    const nightsEl = document.getElementById('stay-nights');
    const guestsEl = document.getElementById('guest-count');

    if (nightsEl) {
        nightsEl.addEventListener('input', () => {
            state.nights = Math.max(1, Math.min(30, parseInt(nightsEl.value) || 1));
            nightsEl.value = state.nights;
            pushHistory();
            renderTable();
        });
    }

    if (guestsEl) {
        guestsEl.addEventListener('input', () => {
            state.guests = Math.max(1, Math.min(10, parseInt(guestsEl.value) || 1));
            guestsEl.value = state.guests;
            if (state.guests > 2) showToast(`Guest surcharge of ${fmt(config.guestSurcharge)}/night/extra guest applied.`, 'warn');
            pushHistory();
            renderTable();
        });
    }
}

// ── BREAKDOWN BAR INJECTION ───────────────────────────────────────
function injectBreakdownBar() {
    const totalBox = document.querySelector('.total-box');
    if (!totalBox || document.getElementById('breakdown-bar')) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top:12px;width:100%;';
    wrap.innerHTML = `
        <div style="font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.4);margin-bottom:6px;">COST BREAKDOWN</div>
        <div id="breakdown-bar" style="width:100%;height:6px;display:flex;border-radius:3px;overflow:hidden;gap:2px;"></div>
        <div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap;" id="bar-legend"></div>
    `;
    totalBox.appendChild(wrap);

    // Legend
    const legendColors = ['#b2905a', '#d4af7a', '#888', '#27ae60'];
    const legendLabels = ['Room', 'Add-ons', 'Tax', 'Discount'];
    const legend = document.getElementById('bar-legend');
    legendLabels.forEach((l, i) => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:9px;color:rgba(255,255,255,.5);letter-spacing:.5px;';
        item.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${legendColors[i]};display:inline-block;"></span>${l}`;
        legend.appendChild(item);
    });
}

// ── PRINT / PDF EXPORT ────────────────────────────────────────────
function initPrintButton() {
    const footer = document.querySelector('.bill-footer');
    if (!footer) return;

    const printBtn = document.createElement('button');
    printBtn.style.cssText = `
        background:transparent;border:1px solid #ddd;color:#999;
        padding:14px 20px;font-size:10px;font-weight:700;letter-spacing:2px;
        cursor:pointer;transition:.3s;display:flex;align-items:center;gap:8px;margin-top:12px;width:100%;
        justify-content:center;
    `;
    printBtn.innerHTML = `<i class="fa-solid fa-print"></i> PRINT / SAVE AS PDF`;
    printBtn.addEventListener('click', () => { window.print(); });
    printBtn.addEventListener('mouseenter', () => { printBtn.style.borderColor = 'var(--dark)'; printBtn.style.color = 'var(--dark)'; });
    printBtn.addEventListener('mouseleave', () => { printBtn.style.borderColor = '#ddd'; printBtn.style.color = '#999'; });
    footer.after(printBtn);
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────
function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
        // Ctrl+Z = Undo, Ctrl+Shift+Z = Redo
        if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
            e.preventDefault();
            document.getElementById('undo-btn')?.click();
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
            e.preventDefault();
            document.getElementById('redo-btn')?.click();
        }
        // Ctrl+S = Save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            document.getElementById('save-btn')?.click();
        }
        // Ctrl+P = Print
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });
    showToast('Tip: Use Ctrl+Z to undo, Ctrl+S to save draft.', 'info');
}

// ── GOLD SCROLL PROGRESS BAR ──────────────────────────────────────
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.style.cssText = `position:fixed;top:0;left:0;height:2px;width:0%;
        background:linear-gradient(90deg,#b2905a,#e8c87a,#b2905a);z-index:10001;transition:width .1s linear;`;
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
        const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
        bar.style.width = pct + '%';
    }, { passive: true });
}

// ── CUSTOM LUXURY CURSOR ──────────────────────────────────────────
function initCursor() {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.style.cssText = `position:fixed;width:8px;height:8px;border-radius:50%;background:#b2905a;
        pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:multiply;transition:transform .15s;`;
    ring.style.cssText = `position:fixed;width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(178,144,90,.5);
        pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:left .12s ease,top .12s ease,transform .3s,border-color .3s;`;
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.style.cursor = 'none';

    document.addEventListener('mousemove', e => {
        dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
        ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('button, a, input, select, .addon-card').forEach(el => {
        el.addEventListener('mouseenter', () => { ring.style.transform = 'translate(-50%,-50%) scale(1.7)'; ring.style.borderColor = 'rgba(178,144,90,.9)'; el.style.cursor = 'none'; });
        el.addEventListener('mouseleave', () => { ring.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.borderColor = 'rgba(178,144,90,.5)'; });
    });
}

// ═══════════════════════════════════════════════════════════════
//  BOOTSTRAP — run everything in order
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

    // Restore draft if available
    const hadDraft = loadDraft();
    if (hadDraft) {
        const nightsEl = document.getElementById('stay-nights');
        const guestsEl = document.getElementById('guest-count');
        const checkinEl = document.getElementById('checkin-date');
        if (nightsEl) nightsEl.value = state.nights;
        if (guestsEl) guestsEl.value = state.guests;
        if (checkinEl) checkinEl.value = state.checkin;
        showToast('Draft restored from your last session.', 'info');
    }

    // Build UI layers in order
    initDateLogic();
    initAddOns();
    initPromoSection();
    injectBreakdownBar();
    initCurrencySelector();
    initUndoRedo();
    initInputHandlers();
    initCheckoutButton();
    initScrollReveal();
    initScrollProgress();
    initPrintButton();
    initKeyboardShortcuts();
    initCursor();

    // Initial render & first history snapshot
    renderTable(false);
    pushHistory();
});

/**
 * ============================================================
 *  RESORTIFY — site-nav.js  (Include on EVERY page)
 *
 *  PURPOSE: Links all pages together seamlessly.
 *
 *  ADD THIS to every HTML file just before </body>:
 *    <script src="site-nav.js"></script>
 *
 *  FEATURES:
 *  1. Page Transition     — elegant fade-out → fade-in between pages
 *  2. Active Nav Link     — highlights the current page in navbar
 *  3. Breadcrumb          — shows current page path below navbar
 *  4. "Book a Stay" btn   — always routes to offers.html
 *  5. Mobile Hamburger    — proper toggle for all pages
 *  6. Scroll-hide navbar  — auto-hides on scroll down, shows on up
 *  7. Toast on arrival    — subtle welcome message on first visit
 * ============================================================
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     1. PAGE TRANSITION — luxury fade between pages
  ────────────────────────────────────────────────────────── */
  const PageTransition = (() => {

    function init() {
      // Inject the overlay element
      const overlay = document.createElement('div');
      overlay.id = 'page-transition-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0;
        background: #fff;
        z-index: 999999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.35s ease;
      `;
      document.body.appendChild(overlay);

      // Fade in on arrival (from white → transparent)
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
      });

      // Intercept all internal link clicks
      document.addEventListener('click', e => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        // Only handle internal .html links (not # anchors, not external)
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
        if (link.target === '_blank') return;

        e.preventDefault();
        // Fade to white, then navigate
        overlay.style.opacity = '1';
        setTimeout(() => {
          window.location.href = href;
        }, 350);
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     2. ACTIVE NAV LINK — highlights current page
  ────────────────────────────────────────────────────────── */
  const ActiveNav = (() => {

    function init() {
      const current = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-links a, .nav-links li > a').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === current || href.includes(current.replace('.html', ''))) {
          link.style.color = '#b2905a';
          link.style.fontWeight = '700';
          link.style.borderBottom = '2px solid #b2905a';
          link.style.paddingBottom = '2px';
        }
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     3. "BOOK A STAY" BUTTON — always routes correctly
  ────────────────────────────────────────────────────────── */
  const BookBtn = (() => {

    function init() {
      // Fix the broken <button class="book-btn" <a href="offers.html"> in index.html
      document.querySelectorAll('.book-btn, .book-now, [class*="book-stay"]').forEach(btn => {
        if (btn.tagName === 'BUTTON') {
          btn.style.cursor = 'pointer';
          btn.addEventListener('click', () => {
            window.location.href = 'offers.html';
          });
        }
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     4. MOBILE HAMBURGER — consistent across all pages
  ────────────────────────────────────────────────────────── */
  const MobileMenu = (() => {

    function init() {
      const hamburger = document.getElementById('hamburger')
                     || document.querySelector('.hamburger');
      const navLinks  = document.querySelector('.nav-links');
      if (!hamburger || !navLinks) return;

      // Inject mobile nav styles once
      if (!document.getElementById('mobile-nav-style')) {
        const style = document.createElement('style');
        style.id = 'mobile-nav-style';
        style.textContent = `
          @media (max-width: 900px) {
            .nav-links {
              display: none;
              flex-direction: column !important;
              position: fixed !important;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(255,255,255,0.98) !important;
              padding: 100px 40px 40px !important;
              z-index: 9998 !important;
              box-shadow: none !important;
              overflow-y: auto;
              backdrop-filter: blur(8px);
            }
            .nav-links.mobile-open {
              display: flex !important;
              animation: mobileNavIn 0.4s cubic-bezier(0.25,1,0.5,1);
            }
            .nav-links li {
              border-bottom: 1px solid #f0f0f0;
              padding: 18px 0;
            }
            .nav-links li a {
              font-size: 18px !important;
              letter-spacing: 2px !important;
            }
            @keyframes mobileNavIn {
              from { opacity: 0; transform: translateY(-20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            /* Hamburger → X animation */
            .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
            .hamburger.open span:nth-child(2) { opacity: 0; }
            .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }
            .hamburger span { transition: transform 0.3s ease, opacity 0.3s ease; display: block; }
          }
        `;
        document.head.appendChild(style);
      }

      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
        hamburger.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (!e.target.closest('.nav-links') && !e.target.closest('.hamburger, #hamburger')) {
          navLinks.classList.remove('mobile-open');
          hamburger.classList.remove('open');
          document.body.style.overflow = '';
        }
      });

      // Close on ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          navLinks.classList.remove('mobile-open');
          hamburger.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     5. SCROLL-HIDE NAVBAR — any page navbar
  ────────────────────────────────────────────────────────── */
  const ScrollNav = (() => {

    function init() {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;

      let lastY = 0;

      // Inject scrolled state style
      if (!document.getElementById('scroll-nav-style')) {
        const style = document.createElement('style');
        style.id = 'scroll-nav-style';
        style.textContent = `
          .navbar {
            transition: transform 0.4s ease, background 0.3s ease, box-shadow 0.3s ease;
          }
          .navbar.nav-hidden {
            transform: translateY(-100%);
          }
          .navbar.nav-scrolled {
            background: rgba(255,255,255,0.98) !important;
            box-shadow: 0 4px 30px rgba(0,0,0,0.07) !important;
          }
        `;
        document.head.appendChild(style);
      }

      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('nav-scrolled', y > 60);
        navbar.classList.toggle('nav-hidden', y > lastY && y > 200);
        lastY = y;
      }, { passive: true });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     6. FIRST-VISIT TOAST — subtle welcome on first page load
  ────────────────────────────────────────────────────────── */
  const WelcomeToast = (() => {

    function init() {
      // Only show once per session
      if (sessionStorage.getItem('resortify_welcomed')) return;
      sessionStorage.setItem('resortify_welcomed', '1');

      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed; bottom: 28px; left: 28px;
        background: #1a1a1a; color: #fff;
        padding: 14px 22px;
        border-left: 3px solid #b2905a;
        font-size: 11px; letter-spacing: 1px;
        font-family: 'Inter', sans-serif;
        z-index: 99999;
        opacity: 0; transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
        max-width: 280px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      `;
      toast.textContent = '✦ Welcome to Resortify. Explore luxury reimagined.';
      document.body.appendChild(toast);

      setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; }, 1200);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
      }, 5000);
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     7. FIX KNOWN HTML BUGS across pages
        - bill.html stray "q2" text
        - index.html broken <button> tag
  ────────────────────────────────────────────────────────── */
  const BugFixer = (() => {

    function init() {
      // Remove stray text nodes (e.g. "q2" in bill.html)
      document.querySelectorAll('.stepper-container, .step-line').forEach(el => {
        el.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'q2') {
            node.remove();
          }
        });
      });
    }

    return { init };
  })();


  /* ──────────────────────────────────────────────────────────
     BOOT
  ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    PageTransition.init();
    ActiveNav.init();
    BookBtn.init();
    MobileMenu.init();
    ScrollNav.init();
    WelcomeToast.init();
    BugFixer.init();
  });

}());