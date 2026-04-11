// Helpers to shorten document queries
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

let curr = '0', prev = '', op = null, reset = false, lastEq = '';

const update = () => {
    $('previous-operand').textContent = lastEq;
    $('current-operand').textContent = op ? (reset ? `${prev} ${op}` : `${prev} ${op} ${curr}`) : curr;
    // Toggles the active highlight on operators in one line
    $$('.operator').forEach(b => b.classList.toggle('active', b.dataset.operator === op));
};

const append = num => {
    if (num === '.' && curr.includes('.')) return;
    curr = (curr === '0' || reset) ? num : curr + num;
    reset = false;
    update();
};

const chooseOp = newOp => {
    if (op && !reset) calc();
    prev = curr; op = newOp; reset = true; lastEq = '';
    update();
};

const calc = () => {
    if (!op || reset) return;
    const p = parseFloat(prev), c = parseFloat(curr);
    if (isNaN(p) || isNaN(c)) return;

    if (op === '/' && c === 0) {
        curr = "Error"; op = null; prev = lastEq = ''; reset = true;
        return update();
    }

    const res = op === '+' ? p+c : op === '-' ? p-c : op === '*' ? p*c : p/c;
    lastEq = `${prev} ${op} ${curr} =`;
    curr = Math.round(res * 1e8) / 1e8; // Shortened rounding logic
    op = null; prev = ''; reset = true;
    update();
};

const clearAll = () => { curr = '0'; prev = ''; op = null; reset = false; lastEq = ''; update(); };

const del = () => {
    if (reset && op) { op = null; curr = prev; prev = ''; reset = false; }
    else if (reset && !op) reset = false;
    else if (curr === 'Error') curr = '0';
    else if (curr !== '0') { curr = curr.slice(0, -1); if (!curr || curr === '-') curr = '0'; }
    else if (curr === '0' && op) { op = null; curr = prev; prev = ''; }
    update();
};

// Event Listeners
$$('.number').forEach(b => b.onclick = () => append(b.textContent));
$$('.operator').forEach(b => b.onclick = () => chooseOp(b.dataset.operator));
$('equals').onclick = calc;
$('all-clear').onclick = clearAll;
$('backspace').onclick = del;

// Keyboard Support
document.onkeydown = e => {
    if (/[0-9.]/.test(e.key)) append(e.key);
    if (e.key === '=' || e.key === 'Enter') { e.preventDefault(); calc(); }
    if (e.key === 'Backspace') del();
    if (e.key === 'Escape') clearAll();
    if (['+', '-', '*', '/'].includes(e.key)) chooseOp(e.key);
};