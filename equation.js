const polyInputs = document.getElementById("polyInputs");
const polyResult = document.getElementById("polyResult");
const solvePolyBtn = document.getElementById("solvePolyBtn");
const modeBtns = document.querySelectorAll(".mode-btn");

let currentDegree = 2;

function renderInputs() {
  polyInputs.innerHTML = "";
  const coeffs = currentDegree === 2 ? ["a", "b", "c"] : 
                 currentDegree === 3 ? ["a", "b", "c", "d"] :
                 ["a", "b", "c", "d", "e"];
  
  coeffs.forEach((c, i) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "5px";
    
    const label = document.createElement("label");
    label.textContent = `${c}:`;
    label.style.fontSize = "14px";
    
    const input = document.createElement("input");
    input.type = "number";
    input.id = `coeff-${c}`;
    input.className = "matrix-cell";
    input.style.width = "70px";
    input.value = 0;
    
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    polyInputs.appendChild(wrapper);

    if (i < coeffs.length - 1) {
        const power = coeffs.length - 1 - i;
        const text = document.createElement("span");
        text.innerHTML = `x<sup>${power}</sup> + `;
        text.style.alignSelf = "center";
        text.style.marginTop = "20px";
        polyInputs.appendChild(text);
    } else {
        const text = document.createElement("span");
        text.innerHTML = " = 0";
        text.style.alignSelf = "center";
        text.style.marginTop = "20px";
        polyInputs.appendChild(text);
    }
  });
}

modeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    modeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDegree = parseInt(btn.dataset.degree);
    renderInputs();
    polyResult.innerHTML = "";
  });
});

solvePolyBtn.addEventListener("click", () => {
  try {
    if (currentDegree === 2) {
      const a = +document.getElementById("coeff-a").value;
      const b = +document.getElementById("coeff-b").value;
      const c = +document.getElementById("coeff-c").value;
      
      if (a === 0) throw "Coefficient 'a' cannot be 0 for a quadratic equation.";
      
      const discriminant = b * b - 4 * a * c;
      let roots = [];
      
      if (discriminant > 0) {
        const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        roots = [`x₁ = ${math.format(r1, {precision: 4})}`, `x₂ = ${math.format(r2, {precision: 4})}`];
      } else if (discriminant === 0) {
        const r = -b / (2 * a);
        roots = [`x = ${math.format(r, {precision: 4})}`];
      } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-discriminant) / (2 * a);
        roots = [
          `x₁ = ${math.format(real, {precision: 4})} + ${math.format(imag, {precision: 4})}i`,
          `x₂ = ${math.format(real, {precision: 4})} - ${math.format(imag, {precision: 4})}i`
        ];
      }
      polyResult.innerHTML = roots.join("<br>");
    } else if (currentDegree === 3) {
      // Cubic: ax^3 + bx^2 + cx + d = 0
      const a = +document.getElementById("coeff-a").value;
      const b = +document.getElementById("coeff-b").value;
      const c = +document.getElementById("coeff-c").value;
      const d = +document.getElementById("coeff-d").value;

      if (a === 0) throw "Coefficient 'a' cannot be 0 for a cubic equation.";

      // Solve using eigenvalues of companion matrix
      const a1 = b/a, a2 = c/a, a3 = d/a;
      const M = [[0, 1, 0], [0, 0, 1], [-a3, -a2, -a1]];
      
      const eig = math.eigs(M);
      const vals = eig.values.toArray ? eig.values.toArray() : eig.values;
      
      polyResult.innerHTML = vals.map((v, i) => `x${i+1} = ${math.format(v, {precision: 4})}`).join("<br>");
    } else {
      // Quartic: ax^4 + bx^3 + cx^2 + dx + e = 0
      const a = +document.getElementById("coeff-a").value;
      const b = +document.getElementById("coeff-b").value;
      const c = +document.getElementById("coeff-c").value;
      const d = +document.getElementById("coeff-d").value;
      const e = +document.getElementById("coeff-e").value;

      if (a === 0) throw "Coefficient 'a' cannot be 0 for a quartic equation.";

      // Companion matrix for x^4 + (b/a)x^3 + ...
      const c3 = b/a, c2 = c/a, c1 = d/a, c0 = e/a;
      const M = [
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
        [-c0, -c1, -c2, -c3]
      ];
      const eig = math.eigs(M);
      const vals = eig.values.toArray ? eig.values.toArray() : eig.values;
      polyResult.innerHTML = vals.map((v, i) => `x${i+1} = ${math.format(v, {precision: 4})}`).join("<br>");
    }
  } catch (err) {
    polyResult.innerHTML = `<span class="error">${err.message || err}</span>`;
  }
});

const solveGeneralBtn = document.getElementById("solveGeneralBtn");
const generalResult = document.getElementById("generalResult");

solveGeneralBtn.addEventListener("click", () => {
    try {
        const expr = document.getElementById("equationInput").value;
        const guess = parseFloat(document.getElementById("guessInput").value) || 0;
        if (!expr) return;
        
        const f = math.parse(expr);
        const df = math.derivative(expr, 'x');
        
        let x = guess;
        for(let i=0; i<50; i++) {
            const y = f.evaluate({x});
            const dy = df.evaluate({x});
            if (Math.abs(dy) < 1e-9) break;
            const xNew = x - y/dy;
            if (Math.abs(xNew - x) < 1e-7) {
                x = xNew;
                break;
            }
            x = xNew;
        }
        generalResult.innerHTML = `Root: x ≈ ${math.format(x, {precision: 5})}`;
    } catch (err) {
        generalResult.innerHTML = `<span class="error">${err.message || "Error"}</span>`;
    }
});

// System of Linear Equations Logic
const sysModeBtns = document.querySelectorAll(".sys-mode-btn");
const sysInputs = document.getElementById("systemInputs");
const solveSystemBtn = document.getElementById("solveSystemBtn");
const sysResult = document.getElementById("systemResult");
let currentSysVars = 2;

function renderSystemInputs() {
  sysInputs.innerHTML = "";
  const vars = currentSysVars === 2 ? ["x", "y"] : ["x", "y", "z"];
  
  for(let i = 0; i < currentSysVars; i++) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "5px";
    row.style.flexWrap = "wrap";
    
    let html = "";
    vars.forEach((v, idx) => {
      html += `<input type="number" id="sys-${i}-${idx}" class="matrix-cell" style="width: 60px" value="0"> ${v}`;
      if (idx < vars.length - 1) html += " + ";
    });
    html += ` = <input type="number" id="sys-${i}-res" class="matrix-cell" style="width: 60px" value="0">`;
    
    row.innerHTML = html;
    sysInputs.appendChild(row);
  }
}

sysModeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    sysModeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSysVars = parseInt(btn.dataset.vars);
    renderSystemInputs();
    sysResult.innerHTML = "";
  });
});

solveSystemBtn.addEventListener("click", () => {
  try {
    const A = [];
    const B = [];
    for(let i = 0; i < currentSysVars; i++) {
      const row = [];
      for(let j = 0; j < currentSysVars; j++) {
        row.push(parseFloat(document.getElementById(`sys-${i}-${j}`).value) || 0);
      }
      A.push(row);
      B.push(parseFloat(document.getElementById(`sys-${i}-res`).value) || 0);
    }
    
    const x = math.lusolve(A, B);
    const vars = currentSysVars === 2 ? ["x", "y"] : ["x", "y", "z"];
    
    const flat = math.flatten(x);
    const res = flat.toArray ? flat.toArray() : flat;
    
    sysResult.innerHTML = res.map((val, i) => `${vars[i]} = ${math.format(val, {precision: 4})}`).join("<br>");
  } catch (err) {
    sysResult.innerHTML = `<span class="error">${err.message || "Singular matrix or invalid input"}</span>`;
  }
});

renderInputs();
renderSystemInputs();