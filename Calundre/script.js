// --- GET ALL HTML ELEMENTS ---
const previousTextElement = document.getElementById('previous-operand');
const currentTextElement = document.getElementById('current-operand');
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const equalsButton = document.getElementById('equals');
const clearButton = document.getElementById('all-clear');
const backspaceButton = document.getElementById('backspace');

// --- CREATE VARIABLES TO REMEMBER THINGS (STATE) ---
let currentInput = '0';          
let previousInput = '';          
let currentOperator = null;      
let shouldResetScreen = false;   
let equationHistory = '';  
let previousResult = '';     

// --- UPDATE THE SCREEN FUNCTION ---
const updateScreen = () => {
    previousTextElement.textContent = equationHistory;

    if (currentOperator !== null) {
        if (shouldResetScreen === true) {
            currentTextElement.textContent = previousInput + " " + currentOperator;
        } else {
            currentTextElement.textContent = previousInput + " " + currentOperator + " " + currentInput;
        }
    } else {
        currentTextElement.textContent = currentInput;
    }

    operatorButtons.forEach(button => {
        button.classList.remove('active'); 
        
        if (button.dataset.operator === currentOperator) {
            button.classList.add('active'); 
        }
    });
};

// --- ADD NUMBER FUNCTION ---
const addNumber = (number) => {
    if (number === '.' && currentInput.includes('.')) {
        return; 
    }

    if (currentInput === '0' || shouldResetScreen === true) {
        if (shouldResetScreen === true && currentOperator === null && previousResult !== '') {
            equationHistory = "Ans = " + previousResult;
        }
        
        currentInput = number;
        shouldResetScreen = false;
    } else {
        currentInput = currentInput + number;
    }

    updateScreen();
};

// --- CHOOSE OPERATOR FUNCTION ---
const chooseOperator = (operator) => {
    if (currentOperator !== null && shouldResetScreen === false) {
        calculateResult();
    }

    if (currentOperator === null && previousResult !== '') {
        equationHistory = "Ans = " + previousResult;
    } else {
        equationHistory = '';            
    }

    previousInput = currentInput;    
    currentOperator = operator;      
    shouldResetScreen = true;        

    updateScreen();
};

// --- CALCULATE RESULT FUNCTION ---
const calculateResult = () => {
    if (currentOperator === null || shouldResetScreen === true) {
        return;
    }

    let num1 = parseFloat(previousInput);
    let num2 = parseFloat(currentInput);

    if (currentOperator === '/' && num2 === 0) {
        currentInput = "Error";
        currentOperator = null;
        previousInput = '';
        equationHistory = '';
        shouldResetScreen = true;
        updateScreen();
        return;
    }

    let total = 0;

    if (currentOperator === '+') {
        total = num1 + num2;
    } else if (currentOperator === '-') {
        total = num1 - num2;
    } else if (currentOperator === '*') {
        total = num1 * num2;
    } else if (currentOperator === '/') {
        total = num1 / num2;
    }

    equationHistory = previousInput + " " + currentOperator + " " + currentInput + " =";
    
    currentInput = (Math.round(total * 100000000) / 100000000).toString();
    previousResult = currentInput; 
    
    currentOperator = null;
    previousInput = '';
    shouldResetScreen = true;

    updateScreen();
};

// --- CLEAR EVERYTHING FUNCTION ---
const clearCalculator = () => {
    currentInput = '0';
    previousInput = '';
    currentOperator = null;
    shouldResetScreen = false;
    equationHistory = '';
    previousResult = '';
    updateScreen();
};

// --- BACKSPACE / DELETE FUNCTION ---
const deleteLastCharacter = () => {
    if (shouldResetScreen === true && currentOperator !== null) {
        currentOperator = null;
        currentInput = previousInput;
        previousInput = '';
        shouldResetScreen = false;
    } else if (currentInput === 'Error') {
        currentInput = '0';
    } else if (currentInput !== '0') {
        currentInput = currentInput.toString().slice(0, -1);
        if (currentInput === '' || currentInput === '-') {
            currentInput = '0';
        }
    } else if (currentInput === '0' && currentOperator !== null) {
        currentOperator = null;
        currentInput = previousInput;
        previousInput = '';
    }

    updateScreen();
};

// --- CONNECT BUTTONS TO FUNCTIONS (EVENT LISTENERS) ---
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        addNumber(button.textContent);
    });
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        chooseOperator(button.dataset.operator);
    });
});

equalsButton.addEventListener('click', calculateResult);
clearButton.addEventListener('click', clearCalculator);
backspaceButton.addEventListener('click', deleteLastCharacter);

// Arrow function for the keyboard event
document.addEventListener('keydown', (event) => {
    if (/[0-9.]/.test(event.key)) {
        addNumber(event.key);
    }
    if (event.key === '=' || event.key === 'Enter') {
        event.preventDefault(); 
        calculateResult();
    }
    if (event.key === 'Backspace') {
        deleteLastCharacter();
    }
    if (event.key === 'Escape') {
        clearCalculator();
    }
    if (['+', '-', '*', '/'].includes(event.key)) {
        chooseOperator(event.key);
    }
});