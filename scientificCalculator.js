let sciExpression = "";
let angleMode = "DEG"; // DEG | RAD

document.addEventListener("click", handleScientificClick);
document.addEventListener("keydown", handleScientificKeyboard);

function handleScientificClick(e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const keypad = btn.closest('[data-keypad="scientific"]');
  if (!keypad) return;

  processScientific(btn.dataset.value, btn.dataset.fn, btn.dataset.action, btn);
}

function handleScientificKeyboard(e) {
  const allowed = "0123456789+-*/().";
  if (allowed.includes(e.key)) {
    sciExpression += e.key;
    updateDisplay(sciExpression);
  }

  if (e.key === "Backspace") {
    sciExpression = sciExpression.slice(0, -1);
    updateDisplay(sciExpression);
  }

  if (e.key === "Enter") {
    evaluateScientific();
  }

  if (e.key === "Escape") {
    sciExpression = "";
    updateDisplay("");
    updateResult("0");
  }
}

function processScientific(value, fn, action, btn) {
  if (value) {
    sciExpression += value;
    updateDisplay(sciExpression);
    return;
  }

  if (fn) {
    appendFunction(fn);
    return;
  }

  if (action === "toggle-angle") {
    angleMode = angleMode === "DEG" ? "RAD" : "DEG";
    btn.textContent = angleMode;
    return;
  }

  if (action === "backspace") {
    sciExpression = sciExpression.slice(0, -1);
    updateDisplay(sciExpression);
  }

  if (action === "clear") {
    sciExpression = "";
    updateDisplay("");
    updateResult("0");
  }

  if (action === "equals") {
    evaluateScientific();
  }
}

function appendFunction(fn) {
  if (["sin", "cos", "tan"].includes(fn)) {
    sciExpression += `${fn}(`;
  } else if (fn === "log") {
    sciExpression += "log10(";
  } else if (fn === "ln") {
    sciExpression += "log(";
  }
  updateDisplay(sciExpression);
}

function evaluateScientific() {
  try {
    let expr = sciExpression;

    // AUTO-CLOSE parentheses
    const open = (expr.match(/\(/g) || []).length;
    const close = (expr.match(/\)/g) || []).length;
    expr += ")".repeat(Math.max(0, open - close));

    // DEG → RAD conversion (CORRECT WAY)
    if (angleMode === "DEG") {
      expr = expr
        .replace(/sin\(([^)]+)\)/g, "sin(($1) * pi / 180)")
        .replace(/cos\(([^)]+)\)/g, "cos(($1) * pi / 180)")
        .replace(/tan\(([^)]+)\)/g, "tan(($1) * pi / 180)");
    }

    const result = math.evaluate(expr);
    updateResult(result);
    sciExpression = String(result);
    updateDisplay(sciExpression);
  } catch {
    updateResult("Error");
  }
}
