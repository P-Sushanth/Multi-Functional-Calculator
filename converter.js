const categories = {
  Length: {
    base: "m",
    units: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.344,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254
    }
  },
  Weight: {
    base: "g",
    units: {
      g: 1,
      kg: 1000,
      mg: 0.001,
      lb: 453.59237,
      oz: 28.34952
    }
  },
  Temperature: {
    type: "formula",
    units: ["Celsius", "Fahrenheit", "Kelvin"]
  },
  Area: {
    base: "m2",
    units: {
      "m²": 1,
      "km²": 1e6,
      "ft²": 0.092903,
      "acre": 4046.86,
      "hectare": 10000
    }
  },
  Volume: {
    base: "l",
    units: {
      l: 1,
      ml: 0.001,
      gal: 3.78541,
      qt: 0.946353,
      pt: 0.473176,
      cup: 0.236588
    }
  },
  Speed: {
    base: "mps",
    units: {
      "m/s": 1,
      "km/h": 0.277778,
      "mph": 0.44704
    }
  },
  Time: {
    base: "s",
    units: {
      s: 1,
      min: 60,
      h: 3600,
      day: 86400,
      week: 604800
    }
  }
};

const categorySelector = document.getElementById("categorySelector");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const inputValue = document.getElementById("inputValue");
const outputValue = document.getElementById("outputValue");

let currentCategory = "Length";

function init() {
  Object.keys(categories).forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "mode-btn";
    if (cat === currentCategory) btn.classList.add("active");
    btn.textContent = cat;
    btn.onclick = () => setCategory(cat);
    categorySelector.appendChild(btn);
  });

  setCategory(currentCategory);

  inputValue.addEventListener("input", convert);
  fromUnit.addEventListener("change", convert);
  toUnit.addEventListener("change", convert);
}

function setCategory(cat) {
  currentCategory = cat;
  
  [...categorySelector.children].forEach(btn => {
    btn.classList.toggle("active", btn.textContent === cat);
  });

  fromUnit.innerHTML = "";
  toUnit.innerHTML = "";

  const data = categories[cat];
  const unitKeys = data.type === "formula" ? data.units : Object.keys(data.units);

  unitKeys.forEach(u => {
    fromUnit.add(new Option(u, u));
    toUnit.add(new Option(u, u));
  });

  if (unitKeys.length > 1) toUnit.value = unitKeys[1];
  convert();
}

function convert() {
  const val = parseFloat(inputValue.value);
  if (isNaN(val)) return outputValue.value = "";

  const from = fromUnit.value;
  const to = toUnit.value;
  const data = categories[currentCategory];
  
  if (data.type === "formula") {
    let c = from === "Fahrenheit" ? (val - 32) * 5/9 : from === "Kelvin" ? val - 273.15 : val;
    outputValue.value = parseFloat((to === "Fahrenheit" ? c * 9/5 + 32 : to === "Kelvin" ? c + 273.15 : c).toPrecision(6));
  } else outputValue.value = parseFloat((val * data.units[from] / data.units[to]).toPrecision(6));
}

init();