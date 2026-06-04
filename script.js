const products = [
  {
    id: 1,
    brand: "HP",
    name: "HP 14s-fq1092AU",
    price: 49599,
    rating: 4.3,
    processor: "AMD Hexa-Core Ryzen 5",
    ram: "8 GB",
    storage: "512 GB SSD",
    gpu: "Radeon",
    battery: "Upto 9 Hrs",
    display: "14 inch",
  },
  {
    id: 2,
    brand: "Dell",
    name: "Dell G15-5520",
    price: 78500,
    rating: 4.5,
    processor: "Intel Core i5 (12th Gen)",
    ram: "16 GB",
    storage: "512 GB SSD",
    gpu: "GeForce RTX 3050",
    battery: "Upto 10 Hrs",
    display: "15.6 inch",
  },
  {
    id: 3,
    brand: "Lenovo",
    name: "Lenovo Ideapad Slim 3",
    price: 36289,
    rating: 4.0,
    processor: "AMD Hexa-Core Ryzen 5",
    ram: "8 GB",
    storage: "512 GB SSD",
    gpu: "Radeon",
    battery: "Upto 11 Hrs",
    display: "15.6 inch",
  },
  {
    id: 4,
    brand: "Acer",
    name: "Acer One 14 Z8-415",
    price: 39990,
    rating: 4.1,
    processor: "Intel Core i5 (11th Gen)",
    ram: "8 GB",
    storage: "512 GB SSD",
    gpu: "Iris Xe",
    battery: "Upto 8 Hrs",
    display: "14 inch",
  },
  {
    id: 5,
    brand: "ASUS",
    name: "ASUS VivoBook 14 X415EA",
    price: 36990,
    rating: 4.2,
    processor: "Intel Core i3 (11th Gen)",
    ram: "8 GB",
    storage: "512 GB SSD",
    gpu: "UHD",
    battery: "Upto 6 Hrs",
    display: "14 inch",
  },
  {
    id: 6,
    brand: "Apple",
    name: "MacBook Air M1",
    price: 90900,
    rating: 4.8,
    processor: "Apple M1",
    ram: "8 GB",
    storage: "256 GB SSD",
    gpu: "Apple M1",
    battery: "Upto 15 Hrs",
    display: "13.3 inch",
  },
  {
    id: 7,
    brand: "HP",
    name: "HP Pavilion 14-dv2153TU",
    price: 69999,
    rating: 4.4,
    processor: "Intel Core i5 (12th Gen)",
    ram: "16 GB",
    storage: "1 TB SSD",
    gpu: "Iris Xe",
    battery: "Upto 10 Hrs",
    display: "14 inch",
  },
  {
    id: 8,
    brand: "Acer",
    name: "Acer Predator Helios Neo 16",
    price: 104990,
    rating: 4.6,
    processor: "Intel Core i7 (13th Gen)",
    ram: "16 GB",
    storage: "1 TB SSD",
    gpu: "GeForce RTX 4050",
    battery: "Upto 8 Hrs",
    display: "16 inch",
  },
];

const selectors = {
  productA: document.getElementById("productA"),
  productB: document.getElementById("productB"),
};

const rowMap = {
  brand: ["brandA", "brandB"],
  name: ["nameA", "nameB"],
  price: ["priceA", "priceB"],
  rating: ["ratingA", "ratingB"],
  processor: ["processorA", "processorB"],
  ram: ["ramA", "ramB"],
  storage: ["storageA", "storageB"],
  gpu: ["gpuA", "gpuB"],
  battery: ["batteryA", "batteryB"],
  value: ["valueA", "valueB"],
};

function formatCurrency(value) {
  return `₹${value.toLocaleString()}`;
}

function parseNumber(value) {
  const raw = value.match(/[\d\.]+/g);
  return raw ? parseFloat(raw.join("")) : 0;
}

function scoreProcessor(proc) {
  if (!proc) return 0;
  const lower = proc.toLowerCase();
  if (lower.includes("m1") || lower.includes("m2") || lower.includes("m3")) return 95;
  if (lower.includes("core i9") || lower.includes("ryzen 9")) return 90;
  if (lower.includes("core i7") || lower.includes("ryzen 7")) return 85;
  if (lower.includes("core i5") || lower.includes("ryzen 5")) return 75;
  if (lower.includes("core i3") || lower.includes("ryzen 3")) return 60;
  if (lower.includes("celeron") || lower.includes("athlon") || lower.includes("pentium")) return 40;
  return 50;
}

function scoreStorage(storage) {
  const size = parseNumber(storage);
  return storage.toLowerCase().includes("ssd") ? size * 1.2 : size;
}

function scoreGpu(gpu) {
  const lower = gpu.toLowerCase();
  if (lower.includes("rtx") || lower.includes("gtx")) return 90;
  if (lower.includes("iris") || lower.includes("radeon") || lower.includes("uhd")) return 65;
  if (lower.includes("apple") || lower.includes("m1")) return 85;
  return 50;
}

function scoreBattery(battery) {
  return parseNumber(battery) * 6;
}

function getValueScore(product) {
  const priceScore = 100 - Math.min(100, (product.price / 2000));
  const ramScore = parseNumber(product.ram) * 5;
  const processorScore = scoreProcessor(product.processor);
  const storageScore = scoreStorage(product.storage) / 10;
  const gpuScore = scoreGpu(product.gpu) / 2;
  const batteryScore = scoreBattery(product.battery) / 10;
  const total = priceScore + ramScore + processorScore + storageScore + gpuScore + batteryScore;
  return Math.round(total / 6);
}

function loadProductOptions() {
  products.forEach((product) => {
    const optionA = document.createElement("option");
    const optionB = document.createElement("option");
    optionA.value = product.id;
    optionB.value = product.id;
    optionA.textContent = `${product.brand} - ${product.name}`;
    optionB.textContent = `${product.brand} - ${product.name}`;
    selectors.productA.appendChild(optionA);
    selectors.productB.appendChild(optionB);
  });
  selectors.productA.selectedIndex = 0;
  selectors.productB.selectedIndex = 1;
}

function getProductById(id) {
  return products.find((product) => product.id === Number(id));
}

function clearHighlights() {
  Object.values(rowMap).forEach(([aId, bId]) => {
    document.getElementById(aId).classList.remove("highlight");
    document.getElementById(bId).classList.remove("highlight");
  });
}

function setCellValue(id, text, highlight = false) {
  const cell = document.getElementById(id);
  cell.textContent = text;
  cell.classList.toggle("highlight", highlight);
}

function compareField(valueA, valueB, key) {
  if (key === "price") return valueA < valueB ? 0 : valueA > valueB ? 1 : -1;
  if (key === "rating") return valueA > valueB ? 0 : valueA < valueB ? 1 : -1;
  if (key === "ram") return parseNumber(valueA) > parseNumber(valueB) ? 0 : parseNumber(valueA) < parseNumber(valueB) ? 1 : -1;
  if (key === "storage") return scoreStorage(valueA) > scoreStorage(valueB) ? 0 : scoreStorage(valueA) < scoreStorage(valueB) ? 1 : -1;
  if (key === "gpu") return scoreGpu(valueA) > scoreGpu(valueB) ? 0 : scoreGpu(valueA) < scoreGpu(valueB) ? 1 : -1;
  if (key === "battery") return parseNumber(valueA) > parseNumber(valueB) ? 0 : parseNumber(valueA) < parseNumber(valueB) ? 1 : -1;
  if (key === "value") return valueA > valueB ? 0 : valueA < valueB ? 1 : -1;
  return -1;
}

function updateComparison() {
  clearHighlights();
  const productA = getProductById(selectors.productA.value);
  const productB = getProductById(selectors.productB.value);

  if (!productA || !productB || productA.id === productB.id) {
    document.querySelectorAll("tbody td").forEach((cell) => {
      cell.textContent = "—";
      cell.classList.remove("highlight");
    });
    return;
  }

  const comparison = {
    brand: [productA.brand, productB.brand],
    name: [productA.name, productB.name],
    price: [formatCurrency(productA.price), formatCurrency(productB.price)],
    rating: [productA.rating.toFixed(1), productB.rating.toFixed(1)],
    processor: [productA.processor, productB.processor],
    ram: [productA.ram, productB.ram],
    storage: [productA.storage, productB.storage],
    gpu: [productA.gpu, productB.gpu],
    battery: [productA.battery, productB.battery],
    value: [getValueScore(productA), getValueScore(productB)],
  };

  Object.entries(comparison).forEach(([key, [valueA, valueB]]) => {
    const result = compareField(
      key === "price" ? productA.price : key === "rating" ? productA.rating : key === "value" ? valueA : valueA,
      key === "price" ? productB.price : key === "rating" ? productB.rating : key === "value" ? valueB : valueB,
      key,
    );

    setCellValue(rowMap[key][0], valueA, result === 0);
    setCellValue(rowMap[key][1], valueB, result === 1);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadProductOptions();
  updateComparison();
  selectors.productA.addEventListener("change", updateComparison);
  selectors.productB.addEventListener("change", updateComparison);
});
