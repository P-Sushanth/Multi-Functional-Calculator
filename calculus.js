// Differentiation
const diffInput = document.getElementById("diffInput");
const diffResult = document.getElementById("diffResult");
const deriveBtn = document.getElementById("deriveBtn");
const derive2Btn = document.getElementById("derive2Btn");
const tangentBtn = document.getElementById("tangentBtn");
const tangentPoint = document.getElementById("tangentPoint");

function getDerivative(order = 1) {
  try {
    const expr = diffInput.value;
    if (!expr) return;
    
    let d = math.derivative(expr, 'x');
    for(let i = 1; i < order; i++) {
      d = math.derivative(d, 'x');
    }
    
    diffResult.innerHTML = `f${"'".repeat(order)}(x) = ${d.toString()}`;
  } catch (err) {
    diffResult.innerHTML = `<span class="error">${err.message}</span>`;
  }
}

deriveBtn.addEventListener("click", () => getDerivative(1));
derive2Btn.addEventListener("click", () => getDerivative(2));

tangentBtn.addEventListener("click", () => {
  try {
    const expr = diffInput.value;
    const x0 = parseFloat(tangentPoint.value) || 0;
    if (!expr) return;

    const f = math.compile(expr);
    const y0 = f.evaluate({x: x0});
    
    const slope = math.derivative(expr, 'x').evaluate({x: x0});
    
    // y - y0 = m(x - x0) => y = mx + (y0 - m*x0)
    const intercept = y0 - slope * x0;
    const interceptStr = intercept >= 0 ? `+ ${math.format(intercept, {precision: 4})}` : `- ${math.format(Math.abs(intercept), {precision: 4})}`;
    
    diffResult.innerHTML = `Tangent at x=${x0}:<br>y = ${math.format(slope, {precision: 4})}x ${interceptStr}`;
  } catch (err) {
    diffResult.innerHTML = `<span class="error">${err.message}</span>`;
  }
});

// Integration (Simpson's Rule)
const intInput = document.getElementById("intInput");
const intStart = document.getElementById("intStart");
const intEnd = document.getElementById("intEnd");
const intResult = document.getElementById("intResult");
const integrateBtn = document.getElementById("integrateBtn");

function simpsonsRule(f, a, b, n = 100) {
  if (n % 2 !== 0) n++; 
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }
  
  return (sum * h) / 3;
}

integrateBtn.addEventListener("click", () => {
  try {
    const expr = intInput.value;
    const a = parseFloat(intStart.value);
    const b = parseFloat(intEnd.value);
    
    if (!expr || isNaN(a) || isNaN(b)) throw new Error("Invalid input");

    const code = math.compile(expr);
    const f = (x) => code.evaluate({x});
    
    const result = simpsonsRule(f, a, b);
    intResult.innerHTML = `∫ f(x) dx ≈ ${math.format(result, {precision: 5})}`;
  } catch (err) {
    intResult.innerHTML = `<span class="error">${err.message}</span>`;
  }
});

// Limits
const limitInput = document.getElementById("limitInput");
const limitPoint = document.getElementById("limitPoint");
const limitBtn = document.getElementById("limitBtn");
const limitResult = document.getElementById("limitResult");

limitBtn.addEventListener("click", () => {
  try {
    const expr = limitInput.value;
    const val = parseFloat(limitPoint.value);
    if (!expr || isNaN(val)) return;

    const code = math.compile(expr);
    const f = (x) => code.evaluate({x});
    
    const h = 1e-7;
    const left = f(val - h);
    const right = f(val + h);
    
    if (Math.abs(left - right) > 1e-4) {
      limitResult.innerHTML = `Limit might not exist.<br>LHL: ${math.format(left, {precision: 4})}<br>RHL: ${math.format(right, {precision: 4})}`;
    } else {
      limitResult.innerHTML = `lim(x→${val}) ≈ ${math.format((left + right) / 2, {precision: 5})}`;
    }
  } catch (err) {
    limitResult.innerHTML = `<span class="error">${err.message}</span>`;
  }
});

// Taylor Series
const taylorInput = document.getElementById("taylorInput");
const taylorPoint = document.getElementById("taylorPoint");
const taylorOrder = document.getElementById("taylorOrder");
const taylorBtn = document.getElementById("taylorBtn");
const taylorResult = document.getElementById("taylorResult");

taylorBtn.addEventListener("click", () => {
  try {
    const expr = taylorInput.value;
    const a = parseFloat(taylorPoint.value) || 0;
    const n = parseInt(taylorOrder.value) || 3;
    
    if (!expr) return;

    let terms = [];
    let currentDeriv = math.parse(expr);
    
    for (let i = 0; i <= n; i++) {
      const coeffVal = currentDeriv.evaluate({x: a});
      const factorial = math.factorial(i);
      const coeff = coeffVal / factorial;
      
      if (Math.abs(coeff) > 1e-10) {
        const power = i === 0 ? "" : i === 1 ? "(x)" : `(x-${a})^${i}`;
        const termStr = a === 0 && i > 0 ? power.replace(`-${a}`, '') : power; // Simplify if a=0
        terms.push(`${math.format(coeff, {precision: 3})}${termStr}`);
      }
      currentDeriv = math.derivative(currentDeriv, 'x');
    }
    taylorResult.innerHTML = `P${n}(x) = ` + terms.join(" + ").replace(/\+ -/g, "- ");
  } catch (err) {
    taylorResult.innerHTML = `<span class="error">${err.message}</span>`;
  }
});