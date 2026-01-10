let expression = "";

document.addEventListener("click", handleBasicInput);
document.addEventListener("keydown", handleBasicKeyboard);

function handleBasicInput(e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const keypad = btn.closest('[data-keypad="basic"]');
  if (!keypad) return;

  processBasic(btn.dataset.value, btn.dataset.action);
}

function handleBasicKeyboard(e) {
  const allowed = "0123456789+-*/.";
  if (allowed.includes(e.key)) {
    expression += e.key;
    updateDisplay(expression);
  }

  if (e.key === "Backspace") {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
  }

  if (e.key === "Enter") {
    calculate();
  }

  if (e.key === "Escape") {
    expression = "";
    updateDisplay("");
    updateResult("0");
  }
}

function processBasic(value, action) {
  if (value) {
    expression += value;
    updateDisplay(expression);
  }

  if (action === "backspace") {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
  }

  if (action === "clear") {
    expression = "";
    updateDisplay("");
    updateResult("0");
  }

  if (action === "equals") {
    calculate();
  }
}

function calculate() {
  try {
    const result = eval(expression);
    updateResult(result);
    expression = String(result);
    updateDisplay(expression);
  } catch {
    updateResult("Error");
  }
}
