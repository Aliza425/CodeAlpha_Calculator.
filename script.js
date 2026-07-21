const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

let currentValue = '0';
let previousValue = null;
let pendingOperator = null;
let expressionText = '';
let justEvaluated = false;

const opSymbolToJs = { '÷': '/', '×': '*', '−': '-', '+': '+' };

function formatNumber(numStr){
  if (numStr === 'Error') return numStr;
  if (numStr.includes('e')) return numStr;
  const [intPart, decPart] = numStr.split('.');
  const withCommas = Number(intPart).toLocaleString('en-US');
  return decPart !== undefined ? withCommas + '.' + decPart : withCommas;
}

function updateDisplay(){
  resultEl.textContent = formatNumber(currentValue);
  expressionEl.textContent = expressionText || '\u00A0';
}

function inputDigit(d){
  if (justEvaluated){
    currentValue = d;
    expressionText = '';
    justEvaluated = false;
  } else if (currentValue === '0'){
    currentValue = d;
  } else {
    if (currentValue.replace('-', '').replace('.', '').length >= 15) return;
    currentValue += d;
  }
  updateDisplay();
}

function inputDecimal(){
  if (justEvaluated){
    currentValue = '0.';
    expressionText = '';
    justEvaluated = false;
    updateDisplay();
    return;
  }
  if (!currentValue.includes('.')) currentValue += '.';
  updateDisplay();
}

function clearAll(){
  currentValue = '0';
  previousValue = null;
  pendingOperator = null;
  expressionText = '';
  justEvaluated = false;
  updateDisplay();
}

function backspace(){
  if (justEvaluated) return;
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
  updateDisplay();
}

function percent(){
  currentValue = String(parseFloat(currentValue) / 100);
  updateDisplay();
}

function compute(a, op, b){
  a = parseFloat(a); b = parseFloat(b);
  switch(op){
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
  }
}

function chooseOperator(symbol){
  if (pendingOperator && !justEvaluated && previousValue !== null){
    const result = compute(previousValue, opSymbolToJs[pendingOperator], currentValue);
    currentValue = Number.isFinite(result) ? trimFloat(result) : 'Error';
  }
  previousValue = currentValue;
  pendingOperator = symbol;
  expressionText = `${formatNumber(previousValue)} ${symbol}`;
  justEvaluated = false;
  currentValue = currentValue === 'Error' ? '0' : currentValue;
  updateDisplay();
  // reset so next digit starts fresh number
  currentValue = '0';
}

function trimFloat(num){
  if (!Number.isFinite(num)) return 'Error';
  let s = num.toString();
  if (s.includes('.') && s.length > 16){
    s = parseFloat(num.toPrecision(12)).toString();
  }
  return s;
}

function equals(){
  if (pendingOperator === null || previousValue === null) return;
  const fullExpression = `${formatNumber(previousValue)} ${pendingOperator} ${formatNumber(currentValue)} =`;
  const result = compute(previousValue, opSymbolToJs[pendingOperator], currentValue);
  currentValue = Number.isFinite(result) ? trimFloat(result) : 'Error';
  expressionText = fullExpression;
  pendingOperator = null;
  previousValue = null;
  justEvaluated = true;
  updateDisplay();
}

document.querySelector('.keys').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === 'digit') inputDigit(value);
  else if (action === 'decimal') inputDecimal();
  else if (action === 'clear') clearAll();
  else if (action === 'backspace') backspace();
  else if (action === 'percent') percent();
  else if (action === 'operator') chooseOperator(value);
  else if (action === 'equals') equals();
});

window.addEventListener('keydown', (e) => {
  const { key } = e;
  if (/[0-9]/.test(key)) inputDigit(key);
  else if (key === '.') inputDecimal();
  else if (key === '+') chooseOperator('+');
  else if (key === '-') chooseOperator('−');
  else if (key === '*') chooseOperator('×');
  else if (key === '/') { e.preventDefault(); chooseOperator('÷'); }
  else if (key === 'Enter' || key === '=') equals();
  else if (key === 'Escape') clearAll();
  else if (key === 'Backspace') backspace();
  else if (key === '%') percent();
});

updateDisplay();
