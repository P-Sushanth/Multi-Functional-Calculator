const load = async (id, file) => {
    const el = document.getElementById(id);
    const res = await fetch(`partials/${file}`);
    el.innerHTML = await res.text();
  };
  
  (async () => {
    await load("header", "header.html");
    await load("display", "display.html");
    await load("keypad-basic", "keypad-basic.html");
    await load("keypad-scientific", "keypad-scientific.html");
    await load("graph", "graph.html");
    await load("sidebar", "sidebar.html");
    await load("keypad-programming", "keypad-programming.html");
  
    initApp();
  })();
  
  function initApp() {
    const themeBtn = document.querySelector('[data-action="theme"]');
  
    if (themeBtn) {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
      }
  
      themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
  
        themeBtn.innerHTML = isDark
          ? '<i class="fas fa-sun"></i>'
          : '<i class="fas fa-moon"></i>';
      });
    }
  
    document.addEventListener("click", e => {
      const modeBtn = e.target.closest(".mode-btn");
      if (modeBtn) {
        switchMode(modeBtn.dataset.mode);
      }
    });
  }
  
  
  function switchMode(mode) {
    document.querySelectorAll(".mode-btn").forEach(btn =>
      btn.classList.toggle("active", btn.dataset.mode === mode)
    );
  
    // Hide all keypads
    document.querySelectorAll(".keypad").forEach(k =>
      k.classList.add("hidden")
    );
  
    // Hide graph panels
    document.querySelectorAll("[data-panel]").forEach(p =>
      p.classList.add("hidden")
    );
    document.querySelectorAll(".graph-container").forEach(g =>
      g.classList.add("hidden")
    );
  
    if (mode === "graphing") {
      document.querySelector('[data-panel="graph"]').classList.remove("hidden");
      document.getElementById("graphContainer").classList.remove("hidden");
      return;
    }
  
    // Show keypad for other modes
    const keypad = document.querySelector(`[data-keypad="${mode}"]`);
    if (keypad) keypad.classList.remove("hidden");

    // Hide base display by default
document.getElementById("baseDisplay")?.classList.add("hidden");

if (mode === "programming") {
  document.getElementById("baseDisplay")?.classList.remove("hidden");
}
  }
  function updateDisplay(text) {
    document.getElementById("inputDisplay").textContent = text;
  }
  
  function updateResult(value) {
    document.getElementById("result").textContent = value;
  }
  