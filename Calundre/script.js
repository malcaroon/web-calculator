// --- DOM HELPERS ---
// These act like shortcuts so we don't have to type "document.getElementById" every time.
const $ = id => document.getElementById(id); 
const $$ = sel => document.querySelectorAll(sel);

// --- STATE VARIABLES ---
// These remember the current status of the calculator.
let curr = '0';       // The number currently being typed
let prev = '';        // The first number saved before clicking an operator
let op = null;        // The current math operator (+, -, *, /)
let reset = false;    // A flag telling us if the screen needs to wipe before typing the next number
let lastEq = '';      // Stores the final equation string (e.g., "5 + 5 =")

// --- UPDATE DISPLAY ---
// This function syncs our JavaScript variables with the HTML screen.
const update = () => {
    // 1. Update the top small history line
    $('previous-operand').textContent = lastEq;
    
    // 2. Update the main bottom line
    // If we have an operator, show it. If 'reset' is true, we are waiting for the second number.
    $('current-operand').textContent = op ? (reset ? `${prev} ${op}` : `${prev} ${op} ${curr}`) : curr;
    
    // 3. Highlight the active operator button by toggling the CSS 'active' class
    $$('.operator').forEach(b => b.classList.toggle('active', b.dataset.operator === op));
};

// --- TYPE NUMBERS ---
const append = num => {
    // Prevent typing multiple decimals (e.g., 5.5.5)
    if (num === '.' && curr.includes('.')) return;
    
    // If the screen shows '0' or we just hit an operator/equals, replace the text. Otherwise, add to it.
    curr = (curr === '0' || reset) ? num : curr + num;
    reset = false; // We are actively typing now, so don't reset the screen
    update();
};

// --- CHOOSE OPERATOR ---
const chooseOp = newOp => {
    // If we already have a previous number and an operator, calculate that first before moving on (e.g., 5 + 5 + 5)
    if (op && !reset) calc();
    
    prev = curr;       // Save the number we just typed
    op = newOp;        // Save the operator we clicked
    reset = true;      // Tell the calculator to start fresh when the next number is typed
    lastEq = '';       // Clear the history at the top
    update();
};

// --- DO THE MATH ---
const calc = () => {
    // Stop if there is no operator or we haven't typed the second number yet
    if (!op || reset) return;
    
    // Convert strings to actual math numbers
    const p = parseFloat(prev), c = parseFloat(curr);
    if (isNaN(p) || isNaN(c)) return;

    // Handle dividing by zero
    if (op === '/' && c === 0) {
        curr = "Error"; op = null; prev = lastEq = ''; reset = true;
        return update();
    }

    // Do the math based on the operator symbol
    const res = op === '+' ? p+c : op === '-' ? p-c : op === '*' ? p*c : p/c;
    
    lastEq = `${prev} ${op} ${curr} =`;  // Save the full equation to show up top
    curr = Math.round(res * 100000000) / 100000000; // Round to avoid weird long decimals (like 0.300000004)
    
    op = null;     // Clear the operator
    prev = '';     // Clear the previous number
    reset = true;  // The next number typed will start a brand new calculation
    update();
};

// --- CLEAR ALL ---
const clearAll = () => { 
    curr = '0'; prev = ''; op = null; reset = false; lastEq = ''; 
    update(); 
};

// --- BACKSPACE / DELETE ---
const del = () => {
    // Scenario 1: We just clicked an operator, so delete the operator and go back to the first number
    if (reset && op) { op = null; curr = prev; prev = ''; reset = false; }
    // Scenario 2: We just hit Equals, so allow deleting the result normally
    else if (reset && !op) reset = false;
    // Scenario 3: Clear the "Error" message completely
    else if (curr === 'Error') curr = '0';
    // Scenario 4: Normal backspacing (chop off the last character)
    else if (curr !== '0') { 
        curr = curr.toString().slice(0, -1); 
        if (!curr || curr === '-') curr = '0'; // If empty or just a minus sign left, revert to '0'
    }
    // Scenario 5: We deleted the whole second number, hit backspace again to delete the operator
    else if (curr === '0' && op) { op = null; curr = prev; prev = ''; }
    
    update();
};

// --- EVENT LISTENERS (Connecting HTML to JS) ---
// Find all buttons and tell them which function to run when clicked
$$('.number').forEach(b => b.onclick = () => append(b.textContent));
$$('.operator').forEach(b => b.onclick = () => chooseOp(b.dataset.operator));
$('equals').onclick = calc;
$('all-clear').onclick = clearAll;
$('backspace').onclick = del;

// Listen for keyboard presses
document.onkeydown = e => {
    if (/[0-9.]/.test(e.key)) append(e.key);                         // Numbers and decimal
    if (e.key === '=' || e.key === 'Enter') { e.preventDefault(); calc(); } // Calculate
    if (e.key === 'Backspace') del();                                // Backspace
    if (e.key === 'Escape') clearAll();                              // AC
    if (['+', '-', '*', '/'].includes(e.key)) chooseOp(e.key);       // Operators
};