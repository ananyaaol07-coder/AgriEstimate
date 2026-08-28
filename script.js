// Sample values for demonstration. Replace them with locally approved crop recommendations.
const cropData = {
  maize: { name: "Maize", n: 120, p: 60, k: 40, seedRate: 20, rowSpacing: 60, plantSpacing: 20 },
  wheat: { name: "Wheat", n: 120, p: 60, k: 40, seedRate: 100, rowSpacing: 22.5, plantSpacing: "Continuous sowing" },
  rice: { name: "Rice", n: 120, p: 60, k: 40, seedRate: 40, rowSpacing: 20, plantSpacing: 15 },
  soybean: { name: "Soybean", n: 30, p: 60, k: 40, seedRate: 70, rowSpacing: 45, plantSpacing: 5 },
  chickpea: { name: "Chickpea", n: 20, p: 40, k: 20, seedRate: 75, rowSpacing: 30, plantSpacing: 10 }
};

const hectareFactor = unit => unit === "acre" ? 0.404686 : 1;
const number = id => Number(document.getElementById(id).value);
const format = value => Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const cropOptions = Object.entries(cropData)
  .map(([key, crop]) => `<option value="${key}">${crop.name}</option>`)
  .join("");

// Fertilizer page
const fertilizerForm = document.getElementById("fertilizer-form");
if (fertilizerForm) {
  document.getElementById("fertilizer-crop").innerHTML = cropOptions;
  fertilizerForm.addEventListener("submit", event => {
    event.preventDefault();
    const crop = cropData[document.getElementById("fertilizer-crop").value];
    const hectares = number("fertilizer-area") * hectareFactor(document.getElementById("fertilizer-unit").value);
    // Urea is about 46% N, SSP about 16% P2O5 and MOP about 60% K2O.
    const urea = crop.n / 0.46 * hectares;
    const ssp = crop.p / 0.16 * hectares;
    const mop = crop.k / 0.60 * hectares;

    showResult("fertilizer-result", "Estimated fertilizer requirement", [
      ["Urea", `${format(urea)} kg`],
      ["SSP", `${format(ssp)} kg`],
      ["MOP", `${format(mop)} kg`]
    ], `For ${format(hectares)} ha using an NPK recommendation of ${crop.n}:${crop.p}:${crop.k} kg/ha. Confirm timing and split doses with a local expert.`);
  });
}

// Seed rate and spacing page
const seedForm = document.getElementById("seed-form");
if (seedForm) {
  document.getElementById("seed-crop").innerHTML = cropOptions;
  seedForm.addEventListener("submit", event => {
    event.preventDefault();
    const crop = cropData[document.getElementById("seed-crop").value];
    const hectares = number("seed-area") * hectareFactor(document.getElementById("seed-unit").value);
    const seed = crop.seedRate * hectares;
    const population = typeof crop.plantSpacing === "number"
      ? 100000000 / (crop.rowSpacing * crop.plantSpacing) * hectares
      : null;

    showResult("seed-result", "Seed and spacing recommendation", [
      ["Seed required", `${format(seed)} kg`],
      ["Row spacing", `${crop.rowSpacing} cm`],
      ["Plant spacing", typeof crop.plantSpacing === "number" ? `${crop.plantSpacing} cm` : crop.plantSpacing],
      ["Plant population", population ? `${format(population)} plants` : "Not calculated"]
    ], `Calculated for ${format(hectares)} ha at a seed rate of ${crop.seedRate} kg/ha.`);
  });
}

// Maize yield estimation page
const yieldForm = document.getElementById("yield-form");
if (yieldForm) {
  yieldForm.addEventListener("submit", event => {
    event.preventDefault();
    const hectares = number("yield-area") * hectareFactor(document.getElementById("yield-unit").value);
    const rowSpacingMetres = number("row-spacing") / 100;
    const plantSpacingMetres = number("plant-spacing") / 100;
    const plantPopulationPerHa = 10000 / (rowSpacingMetres * plantSpacingMetres) * (number("population-percent") / 100);
    const seedsPerCob = number("rows-per-cob") * number("seeds-per-row");
    const grainWeightPerPlantKg = number("cobs-per-plant") * seedsPerCob * (number("test-weight") / 100) / 1000;
    const kgPerHa = plantPopulationPerHa * grainWeightPerPlantKg;
    const totalKg = kgPerHa * hectares;

    showResult("yield-result", "Estimated maize yield", [
      ["Yield per hectare", `${format(kgPerHa)} kg/ha`],
      ["Yield in quintals", `${format(kgPerHa / 100)} q/ha`],
      ["Total production", `${format(totalKg)} kg`]
    ], `Estimated using ${format(plantPopulationPerHa)} surviving plants/ha and ${format(seedsPerCob)} seeds/cob.`);
  });
}

// Creates and displays a result box on the active calculator page.
function showResult(id, title, items, note) {
  const result = document.getElementById(id);
  result.innerHTML = `<h3>${title}</h3><div class="result-grid">${items.map(([label, value]) =>
    `<div class="result-item"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div><p class="result-note">${note}</p>`;
  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
