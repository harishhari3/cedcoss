let products = [];
const defaultProducts = [
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
];

const selectors = {
  productA: document.getElementById("productA"),
  productB: document.getElementById("productB"),
  productCount: document.getElementById("productCount"),
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  clearSearch: document.getElementById("clearSearch"),
  shareBtn: document.getElementById("shareBtn"),
  shareStatus: document.getElementById("shareStatus"),
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
  const raw = String(value).match(/[\d\.]+/g);
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
  return String(storage || "").toLowerCase().includes("ssd") ? size * 1.2 : size;
}

function scoreGpu(gpu) {
  const lower = String(gpu || "").toLowerCase();
  if (lower.includes("rtx") || lower.includes("gtx")) return 90;
  if (lower.includes("iris") || lower.includes("radeon") || lower.includes("uhd")) return 65;
  if (lower.includes("apple") || lower.includes("m1")) return 85;
  return 50;
}

function scoreBattery(battery) {
  return parseNumber(battery) * 6;
}

function getValueScore(product) {
  const priceScore = 100 - Math.min(100, product.price / 2000);
  const ramScore = parseNumber(product.ram) * 5;
  const processorScore = scoreProcessor(product.processor);
  const storageScore = scoreStorage(product.storage) / 10;
  const gpuScore = scoreGpu(product.gpu) / 2;
  const batteryScore = scoreBattery(product.battery) / 10;
  const total = priceScore + ramScore + processorScore + storageScore + gpuScore + batteryScore;
  return Math.round(total / 6);
}

function standardizeText(value) {
  return (value || "").trim();
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((cell) => cell.trim());
}

function getDerivedRating(product) {
  const base = 2.8;
  const priceFactor = Math.min(1.2, product.price / 100000);
  const processorFactor = scoreProcessor(product.processor) / 100;
  const gpuFactor = scoreGpu(product.gpu) / 100;
  const batteryFactor = Math.min(0.8, parseNumber(product.battery) / 20);
  return Number(
    Math.min(5, Math.max(3, base + priceFactor + processorFactor * 0.8 + gpuFactor * 0.6 + batteryFactor * 0.4)).toFixed(1),
  );
}

function parseProductsFromCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0] || "");
  return lines
    .slice(1)
    .map((line, index) => {
      const cells = parseCsvLine(line);
      const row = headers.reduce((acc, header, idx) => ({ ...acc, [header]: cells[idx] || "" }), {});

      const brand = standardizeText(row.Brand);
      const name = standardizeText(row.Name);
      const price = parseInt(row.Price, 10) || 0;
      const processor = standardizeText(row.Processor_Name || row.Processor_Brand || "");
      const ram = standardizeText(row.RAM || row.RAM_Expandable || "");
      const storage = standardizeText(row.SSD || row.HDD || "");
      const gpu = standardizeText(row.GPU || "Integrated");
      const battery = standardizeText(row.Battery_Life || "");
      const display = standardizeText(row.Display || row.Display_type || "");

      if (!brand || !name || price <= 0) return null;

      return {
        id: index + 1,
        brand,
        name,
        price,
        rating: getDerivedRating({ price, processor, gpu, battery }),
        processor,
        ram,
        storage,
        gpu,
        battery,
        display,
      };
    })
    .filter(Boolean);
}

function loadProductsFromCsv() {
  return fetch("laptop.csv")
    .then((response) => {
      if (!response.ok) throw new Error("Could not load dataset");
      return response.text();
    })
    .then((text) => {
      const csvProducts = parseProductsFromCsv(text);
      products = csvProducts.length ? csvProducts : defaultProducts;
    })
    .catch(() => {
      products = defaultProducts;
    });
}

function loadProductOptions(filtered) {
  const list = filtered && filtered.length ? filtered : products;
  selectors.productA.innerHTML = "";
  selectors.productB.innerHTML = "";

  list.forEach((product) => {
    const optionA = document.createElement("option");
    const optionB = document.createElement("option");
    optionA.value = product.id;
    optionB.value = product.id;
    optionA.textContent = `${product.brand} - ${product.name}`;
    optionB.textContent = `${product.brand} - ${product.name}`;
    selectors.productA.appendChild(optionA);
    selectors.productB.appendChild(optionB);
  });

  if (selectors.productCount) selectors.productCount.textContent = `${list.length} laptops available`;
  if (list.length >= 2) {
    selectors.productA.selectedIndex = 0;
    selectors.productB.selectedIndex = 1;
  } else if (list.length === 1) {
    selectors.productA.selectedIndex = 0;
  }
}

function filterProducts(query) {
  if (!query) return products;
  const q = query.toLowerCase();
  return products.filter((p) => {
    return (
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.processor && p.processor.toLowerCase().includes(q)) ||
      (p.gpu && p.gpu.toLowerCase().includes(q))
    );
  });
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
  loadProductsFromCsv().then(() => {
    if (!products.length) {
      products = defaultProducts;
      if (selectors.productCount) selectors.productCount.textContent = "Failed to load laptop.csv, using fallback product list.";
    }
    loadProductOptions();
    updateComparison();
    selectors.productA.addEventListener("change", updateComparison);
    selectors.productB.addEventListener("change", updateComparison);

    if (selectors.searchBtn) {
      selectors.searchBtn.addEventListener("click", () => {
        const q = selectors.searchInput.value.trim();
        const matches = filterProducts(q);
        loadProductOptions(matches);
        updateComparison();
      });
    }

    if (selectors.clearSearch) {
      selectors.clearSearch.addEventListener("click", () => {
        selectors.searchInput.value = "";
        loadProductOptions();
        updateComparison();
      });
    }

    if (selectors.searchInput) {
      selectors.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") selectors.searchBtn.click();
      });
    }

    if (selectors.shareBtn) {
      selectors.shareBtn.addEventListener("click", async () => {
        const url = window.location.href;
        try {
          await navigator.clipboard.writeText(url);
          if (selectors.shareStatus) selectors.shareStatus.textContent = "Link copied to clipboard!";
        } catch (err) {
          const fallbackInput = document.createElement("input");
          fallbackInput.value = url;
          document.body.appendChild(fallbackInput);
          fallbackInput.select();
          document.execCommand("copy");
          document.body.removeChild(fallbackInput);
          if (selectors.shareStatus) selectors.shareStatus.textContent = "Link copied to clipboard!";
        }
        setTimeout(() => {
          if (selectors.shareStatus) selectors.shareStatus.textContent = "";
        }, 2500);
      });
    }
  });
});
