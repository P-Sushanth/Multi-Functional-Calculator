let currentBase = 10;
let currentValue = "";

const baseMap = {
  BIN: 2,
  OCT: 8,
  DEC: 10,
  HEX: 16
};

const validDigits = {
  2: /^[01]*$/,
  8: /^[0-7]*$/,
  10: /^[0-9]*$/,
  16: /^[0-9A-F]*$/i
};

document.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const keypad = btn.closest('[data-keypad="programming"]');
  if (!keypad) return;

  const digit = btn.dataset.value;
  const base = btn.dataset.base;
  const action = btn.dataset.action;

  if (digit !== undefined) appendDigit(digit);
  if (base) switchBase(base, btn);
  if (action) handleAction(action);
});

function appendDigit(digit) {
  const test = currentValue + digit;
  if (!validDigits[currentBase].test(test)) return;

  currentValue = test.toUpperCase();
  updateAllDisplays();
}

function switchBase(baseKey, btn) {
  const newBase = baseMap[baseKey];

  // highlight active base
  document.querySelectorAll(".base-btn").forEach(b =>
    b.classList.toggle("active", b === btn)
  );

  // toggle HEX keys
  document.querySelectorAll(".hex-key").forEach(k =>
    k.classList.toggle("hidden", baseKey !== "HEX")
  );

  // toggle numeric keys for BIN
  document.querySelectorAll(".num-key").forEach(k => {
    const val = k.dataset.value;
    if (baseKey === "BIN") {
      k.classList.toggle("hidden", val !== "0" && val !== "1");
    } else if (baseKey === "OCT") {
      k.classList.toggle("hidden", Number(val) > 7);
    } else {
      k.classList.remove("hidden"); // DEC / HEX
    }
  });

  if (!currentValue) {
    currentBase = newBase;
    return;
  }

  const decimal = parseInt(currentValue, currentBase);
  currentBase = newBase;
  currentValue = decimal.toString(currentBase).toUpperCase();

  updateAllDisplays();
}


function handleAction(action) {
  if (action === "clear") {
    currentValue = "";
    updateDisplay("");
    updateResult("0");
    updateBaseDisplay(0);
  }

  if (action === "backspace") {
    currentValue = currentValue.slice(0, -1);
    updateAllDisplays();
  }
}

function updateAllDisplays() {
  updateDisplay(currentValue || "0");

  if (!currentValue) {
    updateBaseDisplay(0);
    return;
  }

  const decimal = parseInt(currentValue, currentBase);
  updateResult(decimal);
  updateBaseDisplay(decimal);
}

function updateBaseDisplay(decimal) {
  const binRaw = decimal.toString(2);
  const binGrouped = groupBinary(binRaw);

  document.getElementById("binValue").textContent = binGrouped;
  document.getElementById("octValue").textContent = decimal.toString(8);
  document.getElementById("decValue").textContent = decimal.toString(10);
  document.getElementById("hexValue").textContent =
    decimal.toString(16).toUpperCase();
}

function groupBinary(bin) {
  return bin.replace(/\B(?=(\d{4})+(?!\d))/g, " ");
}
