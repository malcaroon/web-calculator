        const previousOperandElement = document.getElementById('previous-operand');
        const currentOperandElement = document.getElementById('current-operand');
        const numberButtons = document.querySelectorAll('.number');
        const operatorButtons = document.querySelectorAll('.operator');
        const allClearButton = document.getElementById('all-clear');
        const backspaceButton = document.getElementById('backspace');
        const equalsButton = document.getElementById('equals');

        let currentInput = '0';
        let previousInput = '';
        let currentOperator = null;
        let shouldResetDisplay = false;
        let lastEquation = ''; 

        function updateDisplay() {
            previousOperandElement.textContent = lastEquation;
            
            if (currentOperator !== null) {
                if (shouldResetDisplay) {
                    currentOperandElement.textContent = `${previousInput} ${currentOperator}`;
                } else {
                    currentOperandElement.textContent = `${previousInput} ${currentOperator} ${currentInput}`;
                }
            } else {
                currentOperandElement.textContent = currentInput;
            }
        }

        function setActiveOperator(operatorStr) {
            operatorButtons.forEach(btn => btn.classList.remove('active'));
            if (operatorStr) {
                const activeBtn = document.querySelector(`.operator[data-operator="${operatorStr}"]`);
                if (activeBtn) activeBtn.classList.add('active');
            }
        }

        function appendNumber(number) {
            if (currentInput === '0' || shouldResetDisplay) {
                currentInput = number;
                shouldResetDisplay = false;
            } else {
                if (number === '.' && currentInput.includes('.')) return;
                currentInput += number;
            }
            updateDisplay();
        }

        function chooseOperator(operator) {
            if (currentOperator !== null && !shouldResetDisplay) {
                calculate();
            }
            
            previousInput = currentInput;
            currentOperator = operator;
            shouldResetDisplay = true;
            lastEquation = ''; 
            
            setActiveOperator(operator);
            updateDisplay(); 
        }

        function calculate() {
            if (currentOperator === null || shouldResetDisplay) return;

            const prev = parseFloat(previousInput);
            const current = parseFloat(currentInput);
            let result = 0;

            if (isNaN(prev) || isNaN(current)) return;

            lastEquation = `${previousInput} ${currentOperator} ${currentInput} =`;

            switch (currentOperator) {
                case '+': result = prev + current; break;
                case '-': result = prev - current; break;
                case '*': result = prev * current; break;
                case '/':
                    if (current === 0) {
                        currentInput = "Error";
                        currentOperator = null;
                        previousInput = '';
                        lastEquation = '';
                        updateDisplay();
                        shouldResetDisplay = true;
                        setActiveOperator(null);
                        return;
                    }
                    result = prev / current;
                    break;
                default: return;
            }

            currentInput = (Math.round(result * 100000000) / 100000000).toString();
            currentOperator = null;
            previousInput = '';
            shouldResetDisplay = true;
            
            updateDisplay();
            setActiveOperator(null);
        }

        function allClear() {
            currentInput = '0';
            previousInput = '';
            currentOperator = null;
            shouldResetDisplay = false;
            lastEquation = '';
            updateDisplay();
            setActiveOperator(null);
        }

        function backspace() {
            if (shouldResetDisplay && currentOperator !== null) {
                currentOperator = null;          
                currentInput = previousInput;    
                previousInput = '';
                shouldResetDisplay = false;
                setActiveOperator(null);         
                updateDisplay();
                return;
            }

            if (shouldResetDisplay && currentOperator === null) {
                shouldResetDisplay = false;
                lastEquation = ''; 
            }
            
            if (currentInput === 'Error') {
                currentInput = '0';
                updateDisplay();
                return;
            }

            if (currentInput !== '0') {
                currentInput = currentInput.toString().slice(0, -1);
                if (currentInput === '' || currentInput === '-') {
                    currentInput = '0';
                }
            } 
            else if (currentInput === '0' && currentOperator !== null) {
                currentOperator = null;
                currentInput = previousInput;
                previousInput = '';
                setActiveOperator(null);
            }
            
            updateDisplay();
        }

        numberButtons.forEach(button => {
            button.addEventListener('click', () => appendNumber(button.textContent));
        });

        operatorButtons.forEach(button => {
            button.addEventListener('click', () => chooseOperator(button.dataset.operator));
        });

        equalsButton.addEventListener('click', calculate);
        allClearButton.addEventListener('click', allClear);
        backspaceButton.addEventListener('click', backspace);

        document.addEventListener('keydown', (e) => {
            if (e.key >= 0 && e.key <= 9 || e.key === '.') {
                appendNumber(e.key);
            }
            if (e.key === '=' || e.key === 'Enter') {
                e.preventDefault(); 
                calculate();
            }
            if (e.key === 'Backspace') {
                backspace();
            }
            if (e.key === 'Escape') {
                allClear();
            }
            if (['+', '-', '*', '/'].includes(e.key)) {
                chooseOperator(e.key);
            }
        });