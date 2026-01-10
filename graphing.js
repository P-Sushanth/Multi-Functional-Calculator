let is3D = false;

document.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;

  if (action === "plot") plotGraph();
  if (action === "clear-graph") clearGraph();
  if (action === "toggle-3d") toggle3D(btn);
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement.id === "functionInput") {
    plotGraph();
  }
});

function plotGraph() {
  const input = document.getElementById("functionInput").value.trim();
  if (!input) return;

  // Remove "f(x)=" if user types it
  const expr = input.replace(/^f\(x\)\s*=\s*/, "");

  if (isImplicit(expr)) {
    plotImplicit(expr);
    return;
  }
  
  if (is3D) {
    plot3D(expr);
  } else {
    plot2D(expr);
  }
  
}

function plot2D(expr) {
  const x = [];
  const y = [];

  for (let i = -50; i <= 50; i += 0.1) {
    try {
      x.push(i);
      y.push(math.evaluate(expr, { x: i }));
    } catch {
      y.push(null);
    }
  }

  Plotly.newPlot("graphContainer", [{
    x,
    y,
    type: "scatter",
    mode: "lines",
    line: { color: "#00ff88" }
  }], {
    margin: { t: 20 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: "#fff" }
  });
}

function plot3D(expr) {
  const x = [];
  const y = [];
  const z = [];

  for (let i = -10; i <= 10; i += 0.5) {
    x.push(i);
    y.push(i);
  }

  for (let i = 0; i < x.length; i++) {
    z[i] = [];
    for (let j = 0; j < y.length; j++) {
      try {
        z[i][j] = math.evaluate(expr, { x: x[i], y: y[j] });
      } catch {
        z[i][j] = null;
      }
    }
  }

  Plotly.newPlot("graphContainer", [{
    type: "surface",
    x,
    y,
    z
  }], {
    margin: { t: 20 },
    paper_bgcolor: "rgba(0,0,0,0)",
    font: { color: "#fff" }
  });
}

function clearGraph() {
  Plotly.purge("graphContainer");
}

function toggle3D(btn) {
  is3D = !is3D;
  btn.textContent = is3D ? "2D" : "3D";
}
function isImplicit(expr) {
    return expr.includes("=");
  }
  function plotImplicit(expr) {
    const [left, right] = expr.split("=");
    const f = `${left} - (${right})`;
  
    const x = [];
    const y = [];
    const z = [];
  
    for (let i = -3; i <= 3; i += 0.05) {
      x.push(i);
      y.push(i);
    }
  
    for (let i = 0; i < x.length; i++) {
      z[i] = [];
      for (let j = 0; j < y.length; j++) {
        try {
          z[i][j] = math.evaluate(f, { x: x[i], y: y[j] });
        } catch {
          z[i][j] = null;
        }
      }
    }
  
    Plotly.newPlot("graphContainer", [{
      x,
      y,
      z,
      type: "contour",
      contours: {
        start: 0,
        end: 0,
        size: 0.1,
        coloring: "lines"
      },
      line: { color: "#00ff88" }
    }], {
      margin: { t: 20 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#fff" }
    });
  }
    