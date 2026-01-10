const rowsA = document.getElementById("rowsA");
const colsA = document.getElementById("colsA");
const rowsB = document.getElementById("rowsB");
const colsB = document.getElementById("colsB");

const AEl = document.getElementById("matrixA");
const BEl = document.getElementById("matrixB");
const resultEl = document.getElementById("matrixResult");
const scalarEl = document.getElementById("matrixScalarResult");

function build(container, r, c, readonly = false) {
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${c}, 1fr)`;

  for (let i = 0; i < r * c; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.value = 0;
    input.className = "matrix-cell";
    input.disabled = readonly;

    // keyboard navigation
    input.addEventListener("keydown", e => {
      const cells = [...container.children];
      const idx = cells.indexOf(input);

      if (e.key === "ArrowRight") cells[idx + 1]?.focus();
      if (e.key === "ArrowLeft")  cells[idx - 1]?.focus();
      if (e.key === "ArrowDown")  cells[idx + c]?.focus();
      if (e.key === "ArrowUp")    cells[idx - c]?.focus();
    });

    container.appendChild(input);
  }
}

function read(container, r, c) {
  const vals = [...container.querySelectorAll("input")].map(i => +i.value);
  const m = [];
  for (let i = 0; i < r; i++) {
    m.push(vals.slice(i * c, (i + 1) * c));
  }
  return m;
}

function showMatrix(matrix) {
  resultEl.innerHTML = "";
  const m = matrix.toArray ? matrix.toArray() : matrix;
  resultEl.style.gridTemplateColumns = `repeat(${m[0].length}, 1fr)`;

  m.flat().forEach(v => {
    const cell = document.createElement("input");
    cell.value = math.format(v, { precision: 4 });
    cell.disabled = true;
    cell.className = "matrix-cell";
    resultEl.appendChild(cell);
  });
}

function showScalar(text) {
  scalarEl.style.whiteSpace = "pre-wrap";
  scalarEl.innerText = text;
}

function rebuild() {
  build(AEl, +rowsA.value, +colsA.value);
  build(BEl, +rowsB.value, +colsB.value);
  resultEl.innerHTML = "";
  scalarEl.textContent = "";
}

rowsA.onchange = colsA.onchange = rowsB.onchange = colsB.onchange = rebuild;
rebuild();
function computeRank(matrix, tol = 1e-10) {
  try {
    // Try SVD first if available
    const svd = math.svd(matrix);
    const s = svd.s.toArray ? svd.s.toArray() : svd.s;
    return s.filter(val => Math.abs(val) > tol).length;
  } catch (e) {
    // Fallback: Gaussian Elimination
    const M = matrix.map(row => [...row]);
    const rows = M.length;
    const cols = M[0].length;
    let rank = 0;
    let row = 0;
    for (let col = 0; col < cols && row < rows; col++) {
      let pivot = row;
      while (pivot < rows && Math.abs(M[pivot][col]) < tol) pivot++;
      if (pivot < rows) {
        [M[row], M[pivot]] = [M[pivot], M[row]];
        const val = M[row][col];
        for (let j = col; j < cols; j++) M[row][j] /= val;
        for (let i = 0; i < rows; i++) {
          if (i !== row) {
            const factor = M[i][col];
            for (let j = col; j < cols; j++) M[i][j] -= factor * M[row][j];
          }
        }
        rank++;
        row++;
      }
    }
    return rank;
  }
}
  
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-op]");
  if (!btn) return;

  // Clear previous results
  resultEl.innerHTML = "";
  scalarEl.textContent = "";

  try {
    const rA = +rowsA.value, cA = +colsA.value;
    const rB = +rowsB.value, cB = +colsB.value;

    const A = read(AEl, rA, cA);
    const B = read(BEl, rB, cB);

    switch (btn.dataset.op) {
      case "add":
        if (rA !== rB || cA !== cB)
          throw "A and B must have same dimensions";
        showMatrix(math.add(A, B));
        break;

      case "sub":
        if (rA !== rB || cA !== cB)
          throw "A and B must have same dimensions";
        showMatrix(math.subtract(A, B));
        break;

      case "mul":
        if (cA !== rB)
          throw "Columns of A must match rows of B";
        showMatrix(math.multiply(A, B));
        break;
      
      case "scalar":
        // Scalar Multiplication: Uses the first element of Matrix B as the scalar
        showMatrix(math.multiply(B[0][0], A));
        break;

      case "transpose":
        showMatrix(math.transpose(A));
        break;

      case "inv":
        if (rA !== cA)
          throw "Matrix A must be square";
        showMatrix(math.inv(A));
        break;

      case "det":
        if (rA !== cA)
          throw "Matrix A must be square";
        showScalar(`det(A) = ${math.det(A)}`);
        break;

      case "trace":
        if (rA !== cA)
          throw "Matrix A must be square";
        showScalar(`tr(A) = ${math.trace(A)}`);
        break;

        case "rank": {
            const r = computeRank(A);
            showScalar(`rank(A) = ${r}`);
            break;
          }
          

      case "eigen":
        if (rA !== cA)
          throw "Matrix A must be square";
        const eig = math.eigs(A);
        showMatrix(eig.vectors);
        showScalar(
          "Eigenvalues: " + (eig.values.toArray ? eig.values.toArray() : eig.values).map(v => math.format(v, {precision: 4})).join(", ") +
          "\n(Matrix of Eigenvectors displayed)"
        );
        break;

      case "diagonalize":
        if (rA !== cA) throw "Matrix A must be square";
        const dEig = math.eigs(A);
        showMatrix(dEig.vectors);
        showScalar(
          "Diagonalization (A = PDP⁻¹):\n" +
          "P (Eigenvectors) is displayed above.\n" +
          "D (Eigenvalues): " + (dEig.values.toArray ? dEig.values.toArray() : dEig.values).map(v => math.format(v, {precision: 4})).join(", ")
        );
        break;

      case "gram_schmidt":
        const qr = math.qr(A);
        showMatrix(qr.Q);
        showScalar("Orthogonal Matrix Q displayed (from QR decomposition).");
        break;

      case "svd":
        let svd;
        if (typeof math.svd === "function") {
          svd = math.svd(A);
        } else {
          // Fallback: SVD using eigenvalues of A*A^T (A*A^T = U*S^2*U^T)
          const At = math.transpose(A);
          const AAt = math.multiply(A, At);
          const eig = math.eigs(AAt);
          const vals = eig.values.toArray ? eig.values.toArray() : eig.values;
          const vecs = eig.vectors.toArray ? eig.vectors.toArray() : eig.vectors;
          
          const items = vals.map((v, i) => ({
            v: math.abs(v),
            u: vecs.map(row => row[i])
          })).sort((a, b) => b.v - a.v);
          
          svd = {
            s: items.map(item => math.sqrt(item.v)),
            u: vecs.map((_, r) => items.map(item => item.u[r]))
          };
        }
        showMatrix(svd.u);
        showScalar(
          "SVD (A = UΣVᵀ):\n" +
          "Matrix U is displayed above.\n" +
          "Singular Values (Σ): " + (svd.s.toArray ? svd.s.toArray() : svd.s).map(v => math.format(v, {precision: 4})).join(", ")
        );
        break;

      case "row_swap": {
        const r1 = parseInt(prompt("Row 1 index (0-based):", "0"));
        const r2 = parseInt(prompt("Row 2 index (0-based):", "1"));
        if (isNaN(r1) || isNaN(r2) || r1 < 0 || r1 >= rA || r2 < 0 || r2 >= rA) throw "Invalid indices";
        const M = A.map(r => [...r]);
        [M[r1], M[r2]] = [M[r2], M[r1]];
        showMatrix(M);
        break;
      }

      case "row_scale": {
        const r = parseInt(prompt("Row index (0-based):", "0"));
        const k = parseFloat(prompt("Scale factor:", "2"));
        if (isNaN(r) || isNaN(k) || r < 0 || r >= rA) throw "Invalid input";
        const M = A.map(r => [...r]);
        M[r] = math.multiply(M[r], k);
        showMatrix(M);
        break;
      }

      case "row_add": {
        const t = parseInt(prompt("Target Row index:", "0"));
        const s = parseInt(prompt("Source Row index:", "1"));
        const k = parseFloat(prompt("Multiplier for Source:", "1"));
        if (isNaN(t) || isNaN(s) || isNaN(k) || t < 0 || t >= rA || s < 0 || s >= rA) throw "Invalid input";
        const M = A.map(r => [...r]);
        M[t] = math.add(M[t], math.multiply(M[s], k));
        showMatrix(M);
        break;
      }

      case "inner":
        if (rA !== rB || cA !== cB)
          throw "A and B must have same dimensions for Inner Product";
        showScalar(`Inner Product: ${math.format(math.sum(math.dotMultiply(A, B)), { precision: 4 })}`);
        break;

      case "outer":
        showMatrix(math.kron(A, B));
        break;
    }
  } catch (err) {
    showScalar(typeof err === "string" ? err : (err.message || "Invalid matrix operation"));
  }
});
