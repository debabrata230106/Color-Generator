// ====== CONFIG MAPS ======
const moodHueMap = {
  calm: [180, 220],
  angry: [0, 20],
  love: [330, 360],
  joy: [40, 60],
  mystery: [250, 280],
  energy: [20, 40],
  sadness: [200, 240],
  hope: [100, 140],
};

const shadeMap = {
  light: { lightness: [70, 90], saturation: [30, 50] },
  dark: { lightness: [20, 40], saturation: [50, 70] },
};

const familyHueMap = {
  red: [0, 10],
  blue: [200, 240],
  green: [100, 140],
  yellow: [40, 60],
  purple: [260, 280],
  teal: [170, 190],
  pastel: null,
  earth: null,
  neon: null,
  warm: [0, 60],
  cool: [180, 300],
};

const useMap = {
  background: { saturation: "low", contrast: "low" },
  buttons: { saturation: "medium", contrast: "high" },
  branding: { saturation: "high", contrast: "medium" },
  gradients: { saturation: "medium", contrast: "medium" },
  text: { saturation: "low", contrast: "high" },
};

// ====== HELPERS ======
const getHueRange = (mood, family) => {
  const moodHue = moodHueMap[mood] || [0, 360];
  const familyHue = familyHueMap[family] || moodHue;
  const hueMin = Math.max(moodHue[0], familyHue[0]);
  const hueMax = Math.min(moodHue[1], familyHue[1]);
  return hueMin <= hueMax
    ? [hueMin, hueMax]
    : [(hueMin + hueMax) / 2 - 10, (hueMin + hueMax) / 2 + 10];
};

const getSatLightRange = (shade, family, use) => {
  const shadeBase = shadeMap[shade] || shadeMap.light;
  let [lightMin, lightMax] = shadeBase.lightness;
  let [satMin, satMax] = shadeBase.saturation;

  switch (family) {
    case "pastel":
      lightMin = 80; lightMax = 95;
      satMin = 20; satMax = 40;
      break;
    case "earth":
      lightMin = 40; lightMax = 60;
      satMin = 20; satMax = 40;
      break;
    case "neon":
      lightMin = 50; lightMax = 70;
      satMin = 80; satMax = 100;
      break;
  }

  const useCase = useMap[use];
  if (useCase?.saturation === "low") {
    satMin = Math.max(10, satMin - 10);
    satMax = Math.max(20, satMax - 10);
  } else if (useCase?.saturation === "high") {
    satMin = Math.min(90, satMin + 20);
    satMax = Math.min(100, satMax + 20);
  } else if (useCase?.saturation === "medium") {
    satMin = Math.max(40, satMin);
    satMax = Math.min(70, satMax);
  }

  return { lightRange: [lightMin, lightMax], satRange: [satMin, satMax] };
};

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function rgbToHex(r, g, b) {
  const toHex = c => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  let rgb = [
    Math.round(255 * f(0)), // R
    Math.round(255 * f(8)), // G
    Math.round(255 * f(4))  // B
  ];
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function hexToHsl(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [
    Math.round(h * 360),          // Hue
    Math.round(s * 100),          // Saturation
    Math.round(l * 100)           // Lightness
  ];
}

const generateColors = (count, hueRange, satRange, lightRange) => {
  const hslColors = [];
  for (let i = 0; i < count; i++) {
    const h = getRandomInt(hueRange[0], hueRange[1]);
    const s = getRandomInt(satRange[0], satRange[1]);
    const l = getRandomInt(lightRange[0], lightRange[1]);
    hslColors.push(`hsl(${h}, ${s}%, ${l}%)`);
  }
  return hslColors;
};

const renderPalette = (colors) => {
  const colorBox = document.querySelectorAll("#color-box > div");
  colorBox.forEach((box, i) => {
    if (colors[i]) {
      box.children[0].style.backgroundColor = colors[i];
      box.children[1].innerText = colors[i];
    }
  });
};

// ====== MAIN EVENT ======
document.querySelectorAll(".generate").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();

    const use = document.querySelector('input[name="use"]:checked').value.toLowerCase();
    const family = document.querySelector('input[name="family"]:checked').value.toLowerCase();
    const mood = document.querySelector('input[name="mood"]:checked').value.toLowerCase();
    const shade = document.querySelector('input[name="shade"]:checked').value.toLowerCase();

    const hueRange = getHueRange(mood, family);
    const { lightRange, satRange } = getSatLightRange(shade, family, use);

    const colors = generateColors(document.querySelectorAll("#color-box > div").length, hueRange, satRange, lightRange);
    renderPalette(colors);
  });
});

// ====== COPY BUTTONS (delegation) ======
document.querySelector("#color-box").addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON") {
    const hexCodeElement = event.target.previousElementSibling;
    if (hexCodeElement && hexCodeElement.tagName === "P") {
      const hexCode = hexCodeElement.innerText;
      navigator.clipboard.writeText(hexCode).then(() => {
        event.target.innerText = "Copied!";
        setTimeout(() => (event.target.innerText = "copy"), 1000);
      });
    }
  }
});

// ====== Change Color Code on Click ======
document.querySelectorAll("#color-box > div > p").forEach((pElement) => {
  pElement.addEventListener("click", () => {
    const color = pElement.innerText;
    if (color.startsWith("hsl")) {
      let [h, s, l] = color.match(/\d+/g).map(Number);
      const rgbColor = hslToRgb(h, s, l);
      pElement.innerText = rgbColor;
    }
    else if (color.startsWith("rgb")) {
      let [r, g, b] = color.match(/\d+/g).map(Number);
      const hexColor = rgbToHex(r, g, b);
      pElement.innerText = hexColor;
    }
    else {
      const [h, s, l] = hexToHsl(color);
      const hslColor = `hsl(${h}, ${s}%, ${l}%)`;
      pElement.innerText = hslColor;
    }
  });
});