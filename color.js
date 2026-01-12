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

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const generateColors = (count, hueRange, satRange, lightRange) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const h = getRandomInt(hueRange[0], hueRange[1]);
    const s = getRandomInt(satRange[0], satRange[1]);
    const l = getRandomInt(lightRange[0], lightRange[1]);
    colors.push(hslToHex(h, s, l));
  }
  return colors;
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
