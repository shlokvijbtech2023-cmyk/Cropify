import { useEffect, useRef, useState } from "react";
import * as pc from "playcanvas";
import {
  CloudRain,
  Droplets,
  Gauge,
  Leaf,
  Map,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { zones } from "@/lib/agri-data";
import { cropProfiles as cropNeeds, type CropId } from "@/lib/crop-profiles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Language = "en" | "hi" | "mr";
type Crop = CropId;
type Weather = "Current" | "Dry spell" | "Heavy rain" | "Heat wave";
type ForecastMode = "current" | "seven-day" | "custom";
type WeatherPoint = { temperature: number; rain: number; humidity: number; wind?: number };
type WeatherApiState = {
  current: WeatherPoint;
  forecast: Array<WeatherPoint & { day: string }>;
  source: string;
};
const locationCoordinates: Record<string, [number, number]> = {
  "Nashik, Maharashtra": [20.011, 73.79],
  "Nagpur, Maharashtra": [21.1458, 79.0882],
  "Pune, Maharashtra": [18.5204, 73.8567],
};
const copy = {
  control: { en: "CONTROL CENTER", hi: "नियंत्रण केंद्र", mr: "नियंत्रण केंद्र" },
  location: { en: "Location", hi: "स्थान", mr: "स्थान" },
  crop: { en: "Crop", hi: "फसल", mr: "पीक" },
  weather: { en: "Weather scenario", hi: "मौसम परिदृश्य", mr: "हवामान परिस्थिती" },
  nutrients: { en: "Soil nutrients", hi: "मृदा पोषक तत्व", mr: "मातीतील पोषक घटक" },
  irrigation: { en: "Irrigation", hi: "सिंचाई", mr: "सिंचन" },
  run: { en: "Run simulation", hi: "सिमुलेशन चलाएं", mr: "सिम्युलेशन चालवा" },
  reset: { en: "Reset", hi: "रीसेट", mr: "रीसेट" },
  selected: { en: "Selected field", hi: "चयनित खेत", mr: "निवडलेले शेत" },
  plant: { en: "Plant response", hi: "पौधे की प्रतिक्रिया", mr: "पिकाची प्रतिक्रिया" },
  healthy: { en: "Healthy growth", hi: "स्वस्थ वृद्धि", mr: "निरोगी वाढ" },
  stress: { en: "Stress response", hi: "तनाव प्रतिक्रिया", mr: "ताण प्रतिक्रिया" },
  simulated: {
    en: "Simulated · not measured",
    hi: "सिमुलेटेड · मापा हुआ नहीं",
    mr: "सिम्युलेटेड · मोजलेले नाही",
  },
  forecast: { en: "7-day forecast", hi: "7-दिन का पूर्वानुमान", mr: "7 दिवसांचा अंदाज" },
  survival: { en: "Surviving stand", hi: "जीवित पौधे", mr: "जिवंत पिके" },
  irrigationPlan: { en: "Irrigation plan", hi: "सिंचाई योजना", mr: "सिंचन योजना" },
  custom: { en: "Custom weather", hi: "कस्टम मौसम", mr: "सानुकूल हवामान" },
  current: { en: "Current", hi: "वर्तमान", mr: "सध्याचे" },
  seven: { en: "Next 7 days", hi: "अगले 7 दिन", mr: "पुढील 7 दिवस" },
  dead: { en: "Dead soil / failed stand", hi: "मृत मिट्टी / फसल नष्ट", mr: "मृत माती / पीक नष्ट" },
  moderate: { en: "Partial survival", hi: "आंशिक जीवित", mr: "अंशतः जिवंत" },
  healthyBand: { en: "Healthy stand", hi: "स्वस्थ फसल", mr: "निरोगी पीक" },
  severe: { en: "Severe loss", hi: "गंभीर नुकसान", mr: "गंभीर नुकसान" },
};
const t = (key: keyof typeof copy, language: Language) => copy[key][language];
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
function material(color: pc.Color, gloss = 0.3) {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}
function primitive(
  parent: pc.Entity,
  type: string,
  position: [number, number, number],
  scale: [number, number, number],
  mat: pc.Material,
  angle = 0,
) {
  const e = new pc.Entity();
  e.addComponent("render", { type });
  e.setLocalPosition(...position);
  e.setLocalScale(...scale);
  e.setEulerAngles(0, angle, angle * 0.18);
  e.render!.material = mat;
  parent.addChild(e);
  return e;
}

function addMatureTree(
  parent: pc.Entity,
  x: number,
  z: number,
  variant: number,
  mats: Record<string, pc.Material>,
) {
  const height = 2.8 + (variant % 3) * 0.35;
  primitive(parent, "cylinder", [x, height / 2, z], [0.3, height, 0.3], mats.bark);
  for (const [offset, angle] of [
    [-0.55, -28],
    [0.5, 25],
    [0.05, 0],
  ] as const) {
    const branch = primitive(
      parent,
      "cylinder",
      [x + offset * 0.35, height * 0.62, z],
      [0.13, 1.25, 0.13],
      mats.bark,
    );
    branch.setLocalEulerAngles(0, 0, angle);
  }
  const canopy = [
    [-0.85, height + 0.35, 0.05, 1.25, 1.0, 1.1],
    [0.75, height + 0.45, -0.05, 1.35, 1.1, 1.2],
    [-0.2, height + 1.05, 0.15, 1.2, 1.05, 1.15],
    [0.35, height + 1.12, -0.35, 1.05, 0.9, 1.0],
  ] as const;
  canopy.forEach(([dx, y, dz, sx, sy, sz], index) => {
    primitive(
      parent,
      "sphere",
      [x + dx, y, z + dz],
      [sx, sy, sz],
      index % 2 ? mats.canopyDark : mats.canopy,
    );
  });
  for (let leaf = 0; leaf < 10; leaf += 1) {
    const angle = (leaf / 10) * Math.PI * 2;
    primitive(
      parent,
      "sphere",
      [x + Math.cos(angle) * 1.05, height + 0.55 + (leaf % 3) * 0.3, z + Math.sin(angle) * 0.9],
      [0.35, 0.3, 0.35],
      leaf % 2 ? mats.canopy : mats.canopyLight,
    );
  }
}

function timeOfDay(date: Date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < 5.5 || hour >= 20.5) return "night";
  if (hour < 7) return "dawn";
  if (hour < 17) return "day";
  if (hour < 19) return "sunset";
  return "dusk";
}

function formatClock(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

type CropProfile = {
  moisture: [number, number, number, number];
  temperature: [number, number, number, number];
  humidityRisk: number;
  waterloggingRisk: number;
  nutrientNeed: number;
  droughtSensitivity: number;
};

// Bands are agronomic simulation targets, not measurements from a specific farm:
// [absolute floor, ideal start, ideal end, absolute ceiling].
const cropNeedsLegacy: Record<Crop, CropProfile> = {
  Maize: {
    moisture: [18, 48, 68, 92],
    temperature: [10, 22, 32, 42],
    humidityRisk: 88,
    waterloggingRisk: 76,
    nutrientNeed: 68,
    droughtSensitivity: 1.15,
  },
  Wheat: {
    moisture: [12, 35, 55, 78],
    temperature: [4, 15, 24, 34],
    humidityRisk: 84,
    waterloggingRisk: 62,
    nutrientNeed: 58,
    droughtSensitivity: 0.75,
  },
  Rice: {
    moisture: [38, 68, 88, 100],
    temperature: [15, 24, 34, 41],
    humidityRisk: 96,
    waterloggingRisk: 100,
    nutrientNeed: 64,
    droughtSensitivity: 1.4,
  },
  Sorghum: {
    moisture: [10, 28, 52, 78],
    temperature: [12, 24, 35, 44],
    humidityRisk: 86,
    waterloggingRisk: 55,
    nutrientNeed: 46,
    droughtSensitivity: 0.55,
  },
  "Pearl millet": {
    moisture: [8, 22, 45, 70],
    temperature: [15, 25, 36, 45],
    humidityRisk: 82,
    waterloggingRisk: 48,
    nutrientNeed: 40,
    droughtSensitivity: 0.5,
  },
  Chickpea: {
    moisture: [10, 28, 48, 68],
    temperature: [5, 15, 26, 35],
    humidityRisk: 76,
    waterloggingRisk: 42,
    nutrientNeed: 42,
    droughtSensitivity: 0.8,
  },
  Groundnut: {
    moisture: [18, 42, 65, 84],
    temperature: [18, 24, 32, 40],
    humidityRisk: 82,
    waterloggingRisk: 58,
    nutrientNeed: 52,
    droughtSensitivity: 0.7,
  },
  Soybean: {
    moisture: [24, 48, 72, 90],
    temperature: [12, 20, 30, 38],
    humidityRisk: 86,
    waterloggingRisk: 65,
    nutrientNeed: 60,
    droughtSensitivity: 0.85,
  },
  Tomato: {
    moisture: [24, 48, 70, 86],
    temperature: [12, 18, 28, 36],
    humidityRisk: 78,
    waterloggingRisk: 54,
    nutrientNeed: 72,
    droughtSensitivity: 1.25,
  },
  Potato: {
    moisture: [20, 44, 64, 82],
    temperature: [4, 12, 22, 30],
    humidityRisk: 80,
    waterloggingRisk: 52,
    nutrientNeed: 62,
    droughtSensitivity: 1.35,
  },
  Onion: {
    moisture: [14, 34, 55, 76],
    temperature: [5, 13, 25, 34],
    humidityRisk: 78,
    waterloggingRisk: 48,
    nutrientNeed: 54,
    droughtSensitivity: 1.05,
  },
  Cotton: {
    moisture: [18, 40, 62, 84],
    temperature: [15, 24, 34, 43],
    humidityRisk: 84,
    waterloggingRisk: 58,
    nutrientNeed: 64,
    droughtSensitivity: 0.55,
  },
  Sugarcane: {
    moisture: [35, 62, 84, 100],
    temperature: [16, 24, 34, 43],
    humidityRisk: 94,
    waterloggingRisk: 82,
    nutrientNeed: 78,
    droughtSensitivity: 1.35,
  },
  Banana: {
    moisture: [42, 68, 88, 100],
    temperature: [18, 24, 32, 40],
    humidityRisk: 96,
    waterloggingRisk: 86,
    nutrientNeed: 76,
    droughtSensitivity: 1.45,
  },
};

function bandScore(value: number, band: [number, number, number, number]) {
  const [floor, idealStart, idealEnd, ceiling] = band;
  if (value <= floor || value >= ceiling) return 0;
  if (value < idealStart) return clamp(((value - floor) / (idealStart - floor)) * 100);
  if (value <= idealEnd) return 100;
  return clamp(((ceiling - value) / (ceiling - idealEnd)) * 100);
}
function simulate(
  crop: Crop,
  weather: Weather,
  moisture: number,
  n: number,
  p: number,
  k: number,
  irrigation: number,
  duration: number,
  temperature: number,
  rain: number,
  humidity: number,
) {
  const need = cropNeeds[crop];
  const weatherWaterShift =
    weather === "Dry spell"
      ? -18
      : weather === "Heavy rain"
        ? 18
        : weather === "Heat wave"
          ? -12
          : 0;
  const waterBalance = moisture + irrigation * 0.42 + rain * 0.28 + weatherWaterShift;
  const rawWaterScore = bandScore(waterBalance, need.moisture);
  const waterScore = clamp(100 - (100 - rawWaterScore) * need.droughtSensitivity);
  const tempScore = bandScore(temperature, need.temperature);
  const nutrientAverage = (n + p + k) / 3;
  const nutrientScore = clamp(
    100 -
      Math.abs(nutrientAverage - need.nutrientNeed) * 1.55 -
      (nutrientAverage < 12 || nutrientAverage > 96 ? 22 : 0),
  );
  const waterlogging = Math.max(0, waterBalance - need.moisture[2]);
  const diseasePenalty =
    Math.max(0, humidity - need.humidityRisk) * 1.35 +
    (weather === "Heavy rain" ? Math.max(0, humidity - 78) * 0.25 : 0);
  const waterloggingPenalty = waterlogging * (1.2 - need.waterloggingRisk / 150);
  const irrigationPenalty = irrigation > 45 && duration < 12 ? (irrigation - 45) * 0.7 : 0;
  const health = clamp(
    waterScore * 0.38 +
      tempScore * 0.28 +
      nutrientScore * 0.24 +
      10 -
      diseasePenalty -
      waterloggingPenalty -
      irrigationPenalty,
  );
  const survivalFraction =
    health < 12
      ? 0
      : health < 28
        ? 0.2
        : health < 45
          ? 0.48
          : health < 62
            ? 0.72
            : health < 78
              ? 0.9
              : 1;
  const deadPercent = Math.round((1 - survivalFraction) * 100);
  const status =
    health < 12 ? "dead" : health < 45 ? "severe" : health < 70 ? "moderate" : "healthyBand";
  return {
    health,
    waterScore,
    tempScore,
    nutrientScore,
    survivalFraction,
    deadPercent,
    status,
    canopy: clamp(health * 0.95),
    yieldChange: Math.round((health - 70) * 0.11 * 10) / 10,
  };
}
function addPlant(
  parent: pc.Entity,
  crop: Crop,
  x: number,
  z: number,
  alive: boolean,
  vigor: number,
  mats: Record<string, pc.Material>,
) {
  const h = alive ? 0.45 + vigor * 0.9 : 0.16;
  const stem = alive ? mats.stem : mats.dead;
  primitive(parent, "cylinder", [x, 0.25 + h / 2, z], [0.035, h, 0.035], stem);
  if (!alive) {
    primitive(parent, "box", [x - 0.08, 0.3, z], [0.26, 0.025, 0.05], mats.dead, -22);
    return;
  }
  const leaf = mats.leaf;
  if (["Maize", "Sugarcane"].includes(crop))
    for (let i = 0; i < 4; i++)
      primitive(
        parent,
        "box",
        [x + (i % 2 ? 0.12 : -0.12), 0.35 + h * (0.35 + i * 0.1), z],
        [0.42, 0.035, 0.07],
        leaf,
        i % 2 ? 25 : -25,
      );
  else if (["Wheat", "Sorghum", "Pearl millet"].includes(crop)) {
    for (let i = 0; i < 3; i++)
      primitive(
        parent,
        "box",
        [x + (i - 1) * 0.08, 0.3 + h * (0.35 + i * 0.12), z],
        [0.25, 0.025, 0.045],
        leaf,
        (i - 1) * 25,
      );
    primitive(parent, "cone", [x, 0.3 + h + 0.12, z], [0.12, 0.32, 0.12], mats.gold);
  } else if (crop === "Rice")
    for (let i = 0; i < 5; i++)
      primitive(
        parent,
        "box",
        [x + (i - 2) * 0.07, 0.35 + h * 0.45, z],
        [0.3, 0.025, 0.035],
        leaf,
        (i - 2) * 22,
      );
  else if (crop === "Tomato") {
    for (let i = 0; i < 4; i++) {
      primitive(
        parent,
        "box",
        [x + (i % 2 ? 0.13 : -0.13), 0.4 + h * (0.45 + i * 0.08), z],
        [0.3, 0.06, 0.12],
        leaf,
        i % 2 ? 30 : -30,
      );
      primitive(
        parent,
        "sphere",
        [x + (i % 2 ? 0.18 : -0.18), 0.55 + h * (0.25 + i * 0.08), z],
        [0.09, 0.09, 0.09],
        mats.fruit,
      );
    }
  } else if (crop === "Cotton") {
    for (let i = 0; i < 4; i++)
      primitive(
        parent,
        "box",
        [x + (i % 2 ? 0.13 : -0.13), 0.45 + h * 0.4, z],
        [0.28, 0.07, 0.14],
        leaf,
        i % 2 ? 30 : -30,
      );
    primitive(parent, "sphere", [x, 0.55 + h, z], [0.16, 0.16, 0.16], mats.white);
  } else if (crop === "Banana") {
    primitive(parent, "cylinder", [x, 0.5, z], [0.14, 0.8, 0.14], mats.stem);
    for (let i = 0; i < 5; i++)
      primitive(
        parent,
        "box",
        [x + (i - 2) * 0.16, 0.75 + h * 0.7, z],
        [0.65, 0.04, 0.16],
        leaf,
        (i - 2) * 18,
      );
  } else {
    for (let i = 0; i < 5; i++)
      primitive(
        parent,
        "sphere",
        [x + ((i % 3) - 1) * 0.16, 0.4 + h * 0.55 + (i % 2) * 0.12, z],
        [0.2, 0.16, 0.14],
        leaf,
      );
  }
}

export function FarmSimulationStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbitRef = useRef({
    yaw: 35,
    pitch: 28,
    distance: 25,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });
  const [language, setLanguage] = useState<Language>("en");
  const [location, setLocation] = useState("Nashik, Maharashtra");
  const [crop, setCrop] = useState<Crop>("Maize");
  const [weather, setWeather] = useState<Weather>("Current");
  const [forecastMode, setForecastMode] = useState<ForecastMode>("seven-day");
  const [moisture, setMoisture] = useState(58);
  const [nitrogen, setNitrogen] = useState(56);
  const [phosphorous, setPhosphorous] = useState(48);
  const [potassium, setPotassium] = useState(64);
  const [irrigationAmount, setIrrigationAmount] = useState(25);
  const [irrigationStart, setIrrigationStart] = useState("06:00");
  const [irrigationDuration, setIrrigationDuration] = useState(20);
  const [customTemp, setCustomTemp] = useState(27);
  const [customRain, setCustomRain] = useState(0);
  const [customHumidity, setCustomHumidity] = useState(65);
  const [selectedZone, setSelectedZone] = useState("Z3");
  const [paused, setPaused] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const phase = timeOfDay(clock);
  const phaseLabel =
    phase === "night"
      ? "Night"
      : phase === "dawn"
        ? "Sunrise"
        : phase === "sunset"
          ? "Sunset"
          : phase === "dusk"
            ? "Dusk"
            : "Daylight";
  const phaseSky =
    phase === "night"
      ? "linear-gradient(180deg, #091426 0%, #1b2b3e 48%, #243226 100%)"
      : phase === "dawn"
        ? "linear-gradient(180deg, #d18f76 0%, #e3c28d 42%, #637451 100%)"
        : phase === "sunset"
          ? "linear-gradient(180deg, #c96d5e 0%, #e4a06e 42%, #536143 100%)"
          : phase === "dusk"
            ? "linear-gradient(180deg, #46496c 0%, #8f776d 44%, #3d4a32 100%)"
            : "linear-gradient(180deg, #83b2c3 0%, #b4c3ae 48%, #637650 100%)";
  const [weatherApi, setWeatherApi] = useState<WeatherApiState | null>(null);
  const [weatherApiLoading, setWeatherApiLoading] = useState(false);
  useEffect(() => {
    const [latitude, longitude] =
      locationCoordinates[location] ?? locationCoordinates["Nashik, Maharashtra"];
    const controller = new AbortController();
    setWeatherApiLoading(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&forecast_days=7&timezone=auto`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Weather API unavailable");
        return response.json() as Promise<{
          current: {
            temperature_2m: number;
            relative_humidity_2m: number;
            precipitation: number;
            wind_speed_10m: number;
          };
          daily: {
            time: string[];
            temperature_2m_max: number[];
            temperature_2m_min: number[];
            precipitation_sum: number[];
            relative_humidity_2m_mean: number[];
          };
        }>;
      })
      .then((data) => {
        setWeatherApi({
          source: "Open-Meteo forecast",
          current: {
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            rain: data.current.precipitation,
            wind: data.current.wind_speed_10m,
          },
          forecast: data.daily.time.map((time, index) => ({
            day: index === 0 ? "Today" : `D+${index}`,
            temperature: Math.round(
              (data.daily.temperature_2m_max[index]! + data.daily.temperature_2m_min[index]!) / 2,
            ),
            rain: Math.round(data.daily.precipitation_sum[index] ?? 0),
            humidity: Math.round(data.daily.relative_humidity_2m_mean[index] ?? 0),
          })),
        });
      })
      .catch(() => setWeatherApi(null))
      .finally(() => setWeatherApiLoading(false));
    return () => controller.abort();
  }, [location]);
  const weatherValues =
    weather === "Dry spell"
      ? { temperature: 34, rain: 0, humidity: 35 }
      : weather === "Heavy rain"
        ? { temperature: 25, rain: 38, humidity: 91 }
        : weather === "Heat wave"
          ? { temperature: 42, rain: 0, humidity: 28 }
          : (weatherApi?.current ?? { temperature: 0, rain: 0, humidity: 0 });
  const values =
    forecastMode === "custom"
      ? { temperature: customTemp, rain: customRain, humidity: customHumidity }
      : weatherValues;
  const result = simulate(
    crop,
    weather,
    moisture,
    nitrogen,
    phosphorous,
    potassium,
    irrigationAmount,
    irrigationDuration,
    values.temperature,
    values.rain,
    values.humidity,
  );
  const forecast =
    forecastMode === "seven-day" && weather === "Current" && weatherApi?.forecast.length
      ? weatherApi.forecast
      : Array.from({ length: 7 }, (_, i) => {
          const wave =
            forecastMode === "custom"
              ? { ...values }
              : {
                  temperature: values.temperature + (i % 3) - 1,
                  rain: Math.max(
                    0,
                    values.rain +
                      (weather === "Heavy rain"
                        ? (i % 2) * 16
                        : weather === "Dry spell"
                          ? 0
                          : i === 3
                            ? 14
                            : 2),
                  ),
                  humidity: clamp(values.humidity + (i % 2 ? 5 : -3)),
                };
          return { day: i === 0 ? "Today" : `D+${i}`, ...wave };
        });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const app = new pc.Application(canvas, {
      graphicsDeviceOptions: { antialias: true, alpha: true },
    });
    app.start();
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    const ambient =
      phase === "night"
        ? new pc.Color(0.08, 0.12, 0.2)
        : phase === "dawn" || phase === "sunset"
          ? new pc.Color(0.62, 0.46, 0.38)
          : phase === "dusk"
            ? new pc.Color(0.26, 0.28, 0.42)
            : new pc.Color(0.7, 0.72, 0.68);
    app.scene.ambientLightColor = ambient;
    const world = new pc.Entity("Cropify Farm Landscape");
    app.root.addChild(world);
    const mats = {
      grass: material(new pc.Color(0.18, 0.29, 0.08), 0.12),
      soil: material(new pc.Color(0.27, 0.15, 0.07), 0.08),
      path: material(new pc.Color(0.36, 0.25, 0.15), 0.08),
      leaf: material(new pc.Color(0.16, 0.38, 0.07), 0.18),
      stem: material(new pc.Color(0.13, 0.22, 0.05), 0.12),
      dead: material(new pc.Color(0.3, 0.2, 0.08), 0.08),
      gold: material(new pc.Color(0.68, 0.48, 0.1), 0.12),
      fruit: material(new pc.Color(0.58, 0.05, 0.025), 0.2),
      white: material(new pc.Color(0.78, 0.76, 0.58), 0.18),
      bark: material(new pc.Color(0.18, 0.11, 0.055), 0.08),
      canopy: material(new pc.Color(0.12, 0.28, 0.055), 0.2),
      canopyDark: material(new pc.Color(0.07, 0.18, 0.035), 0.16),
      canopyLight: material(new pc.Color(0.23, 0.4, 0.08), 0.2),
    };
    primitive(world, "box", [0, -0.55, 0], [88, 0.55, 68], mats.grass);
    primitive(world, "box", [0, -0.08, 0], [48, 0.16, 34], mats.soil);
    primitive(world, "box", [0, 0.02, 0], [1, 0.12, 34], mats.path);
    primitive(world, "box", [0, 0.02, 0], [48, 0.12, 1], mats.path);
    const fieldCenters: Array<[number, number]> = [
      [-5.2, -4],
      [0, -4],
      [5.2, -4],
      [-3.5, 4],
      [1.7, 4],
      [6.9, 4],
    ];
    fieldCenters.forEach(([x, z], fieldIndex) => {
      const zone = zones[fieldIndex] ?? zones[0]!;
      const localResult =
        zone.id === selectedZone
          ? result
          : simulate(
              crop,
              weather,
              zone.moisture ?? moisture,
              nitrogen,
              phosphorous,
              potassium,
              irrigationAmount,
              irrigationDuration,
              values.temperature,
              values.rain,
              values.humidity,
            );
      const stress = localResult.survivalFraction < 0.48;
      const fieldMat = material(
        stress ? new pc.Color(0.25, 0.15, 0.06) : new pc.Color(0.36, 0.22, 0.1),
        0.1,
      );
      primitive(world, "box", [x, 0.09, z], [4.6, 0.15, 3.8], fieldMat);
      for (let furrow = -1.5; furrow <= 1.5; furrow += 0.5)
        primitive(world, "box", [x + furrow, 0.18, z], [0.035, 0.025, 3.35], mats.path, 0);
      for (let row = 0; row < 4; row++)
        for (let plant = 0; plant < 8; plant++) {
          const index = row * 8 + plant;
          const alive = index < Math.round(32 * localResult.survivalFraction);
          addPlant(
            world,
            crop,
            x - 1.96 + plant * 0.56,
            z - 1.28 + row * 0.85,
            alive,
            localResult.canopy / 100,
            mats,
          );
        }
    });
    for (let tree = 0; tree < 16; tree++) {
      const x = -15 + (tree % 8) * 4.3;
      const z = tree < 8 ? -10.5 : 10.5;
      addMatureTree(world, x, z, tree, mats);
    }
    for (let strip = -3; strip <= 3; strip += 1) {
      primitive(world, "box", [-25, 0.01, strip * 6.2], [0.08, 0.04, 4.6], mats.path);
      primitive(world, "box", [25, 0.01, strip * 6.2], [0.08, 0.04, 4.6], mats.path);
    }
    const camera = new pc.Entity("Farm Camera");
    camera.addComponent("camera", { clearColor: new pc.Color(0, 0, 0, 0), farClip: 100, fov: 48 });
    const updateCamera = () => {
      const orbit = orbitRef.current;
      const yaw = (orbit.yaw * Math.PI) / 180;
      const pitch = (orbit.pitch * Math.PI) / 180;
      camera.setPosition(
        Math.sin(yaw) * Math.cos(pitch) * orbit.distance,
        Math.sin(pitch) * orbit.distance,
        Math.cos(yaw) * Math.cos(pitch) * orbit.distance,
      );
      camera.lookAt(0, 0, 0);
    };
    updateCamera();
    const handlePointerDown = (event: PointerEvent) => {
      orbitRef.current.dragging = true;
      orbitRef.current.lastX = event.clientX;
      orbitRef.current.lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!orbitRef.current.dragging) return;
      orbitRef.current.yaw -= (event.clientX - orbitRef.current.lastX) * 0.35;
      orbitRef.current.pitch = Math.max(
        10,
        Math.min(68, orbitRef.current.pitch + (event.clientY - orbitRef.current.lastY) * 0.25),
      );
      orbitRef.current.lastX = event.clientX;
      orbitRef.current.lastY = event.clientY;
      updateCamera();
    };
    const handlePointerUp = () => {
      orbitRef.current.dragging = false;
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      orbitRef.current.distance = Math.max(
        18,
        Math.min(58, orbitRef.current.distance + event.deltaY * 0.025),
      );
      updateCamera();
    };
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    app.root.addChild(camera);
    const sun = new pc.Entity("Daylight");
    sun.addComponent("light", {
      type: "directional",
      color:
        phase === "night"
          ? new pc.Color(0.3, 0.4, 0.65)
          : phase === "dawn" || phase === "sunset"
            ? new pc.Color(1, 0.55, 0.32)
            : new pc.Color(1, 0.9, 0.65),
      intensity: paused
        ? 0.2
        : phase === "night"
          ? 0.08
          : phase === "dawn" || phase === "sunset"
            ? 1.15
            : phase === "dusk"
              ? 0.35
              : 2.2,
      castShadows: true,
      shadowDistance: 55,
      shadowResolution: 1024,
    });
    sun.setEulerAngles(
      phase === "night"
        ? 75
        : phase === "dawn"
          ? 12
          : phase === "sunset"
            ? 8
            : phase === "dusk"
              ? 28
              : 45,
      phase === "night" ? 160 : -35,
      0,
    );
    app.root.addChild(sun);
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      app.destroy();
    };
  }, [
    crop,
    weather,
    moisture,
    nitrogen,
    phosphorous,
    potassium,
    irrigationAmount,
    irrigationDuration,
    values.temperature,
    values.rain,
    values.humidity,
    result,
    selectedZone,
    paused,
    phase,
  ]);
  const reset = () => {
    setLocation("Nashik, Maharashtra");
    setCrop("Maize");
    setWeather("Current");
    setForecastMode("seven-day");
    setMoisture(58);
    setNitrogen(56);
    setPhosphorous(48);
    setPotassium(64);
    setIrrigationAmount(25);
    setIrrigationStart("06:00");
    setIrrigationDuration(20);
    setCustomTemp(27);
    setCustomRain(0);
    setCustomHumidity(65);
    setSelectedZone("Z3");
  };
  const slider = (
    label: string,
    value: number,
    setter: (n: number) => void,
    max = 100,
    suffix = "%",
  ) => (
    <label className="block text-xs">
      <span className="mb-1 flex justify-between text-white/60">
        <span>{label}</span>
        <span>
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => setter(Number(e.target.value))}
        className="w-full accent-lime-300"
      />
    </label>
  );
  return (
    <section
      className="relative isolate -mx-4 min-h-[760px] overflow-hidden rounded-2xl border border-black/20 bg-cover bg-center shadow-2xl sm:-mx-6 lg:-mx-8"
      style={{
        backgroundImage: phaseSky,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full min-h-[760px] w-full cursor-grab touch-none active:cursor-grabbing"
        aria-label="Daylight 3D agricultural simulation"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-900/10 via-transparent to-black/40" />
      <div className="absolute left-4 top-4 z-10 max-h-[60%] w-[min(370px,calc(100%-2rem))] overflow-y-auto rounded-xl border border-white/20 bg-slate-950/78 p-4 text-white shadow-xl backdrop-blur-md lg:max-h-[calc(100%-2rem)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[.65rem] font-bold tracking-[.22em] text-lime-200">
              {t("control", language)}
            </p>
            <p className="mt-1 text-xs text-white/60">CROPIFY · LIVING DIGITAL TWIN</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white"
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
        <div className="space-y-3">
          <label className="block text-xs">
            <span className="mb-1 block text-white/60">{t("location", language)}</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-8 w-full rounded border border-white/15 bg-white/10 px-2 text-white"
            >
              <option>Nashik, Maharashtra</option>
              <option>Nagpur, Maharashtra</option>
              <option>Pune, Maharashtra</option>
              <option>Custom coordinates</option>
            </select>
          </label>
          <label className="block text-xs">
            <span className="mb-1 block text-white/60">{t("crop", language)}</span>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value as Crop)}
              className="h-8 w-full rounded border border-white/15 bg-white/10 px-2 text-white"
            >
              {Object.keys(cropNeeds).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            <span className="mb-1 block text-white/60">{t("weather", language)}</span>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value as Weather)}
              className="h-8 w-full rounded border border-white/15 bg-white/10 px-2 text-white"
            >
              <option>Current</option>
              <option>Dry spell</option>
              <option>Heavy rain</option>
              <option>Heat wave</option>
            </select>
          </label>
          <label className="block text-xs">
            <span className="mb-1 block text-white/60">Forecast horizon</span>
            <select
              value={forecastMode}
              onChange={(e) => setForecastMode(e.target.value as ForecastMode)}
              className="h-8 w-full rounded border border-white/15 bg-white/10 px-2 text-white"
            >
              <option value="current">{t("current", language)}</option>
              <option value="seven-day">{t("seven", language)}</option>
              <option value="custom">{t("custom", language)}</option>
            </select>
          </label>
          {forecastMode === "custom" && (
            <div className="space-y-2 rounded border border-amber-200/20 bg-amber-100/5 p-2">
              {slider("Temperature", customTemp, setCustomTemp, 50, "°C")}
              {slider("Rainfall", customRain, setCustomRain, 80, " mm")}
              {slider("Humidity", customHumidity, setCustomHumidity, 100, "%")}
            </div>
          )}
          <div className="border-t border-white/15 pt-3">
            <p className="mb-2 text-[.65rem] font-semibold tracking-[.16em] text-white/65">
              {t("nutrients", language).toUpperCase()} · mg/kg
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["N", nitrogen, setNitrogen],
                  ["P", phosphorous, setPhosphorous],
                  ["K", potassium, setPotassium],
                ] as const
              ).map(([label, value, setter]) => (
                <div key={label}>{slider(label, value, setter)}</div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/15 pt-3">
            <p className="mb-2 text-[.65rem] font-semibold tracking-[.16em] text-white/65">
              {t("irrigationPlan", language).toUpperCase()}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-white/60">
                Start
                <input
                  type="time"
                  value={irrigationStart}
                  onChange={(e) => setIrrigationStart(e.target.value)}
                  className="mt-1 h-8 w-full rounded border border-white/15 bg-white/10 px-2 text-white"
                />
              </label>
              <label className="text-xs text-white/60">
                Duration
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={irrigationDuration}
                  onChange={(e) => setIrrigationDuration(Number(e.target.value))}
                  className="mt-1 h-8 w-full rounded border border-white/15 bg-white/10 px-2 text-white"
                />
              </label>
            </div>
            {slider("Amount", irrigationAmount, setIrrigationAmount, 80, " mm")}
            <p className="mt-1 text-[.62rem] text-sky-200">
              Every day at {irrigationStart} · {irrigationAmount} mm for {irrigationDuration} min
            </p>
          </div>
          {slider("Soil moisture", moisture, setMoisture)}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => setPaused((v) => !v)}
              className="flex-1 gap-2 bg-lime-300 text-slate-950 hover:bg-lime-200"
            >
              {paused ? <Play className="size-3" /> : <Pause className="size-3" />}{" "}
              {paused ? "Resume" : t("run", language)}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={reset}
              className="text-white hover:bg-white/10"
              aria-label={t("reset", language)}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/60 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md">
        <Sun className="size-4 text-amber-300" /> {phaseLabel} · {formatClock(clock)}{" "}
        <span className="text-white/50">|</span> {location}
      </div>
      <div className="absolute right-4 top-16 z-10 w-[min(430px,calc(100%-2rem))] rounded-xl border border-white/20 bg-slate-950/72 p-3 text-white shadow-xl backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[.65rem] font-bold tracking-[.18em]">
            {t("forecast", language).toUpperCase()}
          </span>
          <CloudRain className="size-4 text-sky-200" />
        </div>
        <p className="mb-2 text-[.58rem] text-white/50">
          {weatherApiLoading
            ? "Updating live weather…"
            : weatherApi
              ? `Live source: ${weatherApi.source}`
              : "Live weather unavailable · using scenario inputs"}
        </p>
        <div className="grid grid-cols-7 gap-1">
          {forecast.map((day) => (
            <div key={day.day} className="rounded bg-white/8 p-1 text-center text-[.58rem]">
              <div className="font-semibold">{day.day}</div>
              <div className="text-amber-200">{day.temperature}°</div>
              <div className="text-sky-200">{day.rain}mm</div>
              <div className="text-white/50">RH {day.humidity}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 z-10 w-60 rounded-xl border border-white/20 bg-slate-950/78 p-3 text-white shadow-xl backdrop-blur-md lg:left-[390px]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[.65rem] font-bold tracking-[.18em]">
            {t("selected", language).toUpperCase()}
          </span>
          <Map className="size-4 text-lime-200" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={cn(
                "h-8 rounded border text-[.62rem]",
                selectedZone === zone.id
                  ? "border-lime-200 bg-lime-200/30 text-white"
                  : "border-white/15 bg-white/5 text-white/65",
              )}
            >
              {zone.label.replace("Zone ", "")}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[.65rem] text-white/55">
          {crop} · {location}
        </p>
      </div>
      <div className="absolute bottom-4 right-4 z-10 w-72 rounded-xl border border-white/20 bg-slate-950/78 p-4 text-white shadow-xl backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[.65rem] font-bold tracking-[.16em]">
            {t("plant", language).toUpperCase()}
          </span>
          <Leaf className="size-4 text-lime-200" />
        </div>
        <div
          className={cn(
            "mb-2 rounded border px-2 py-1 text-xs font-semibold",
            result.status === "dead"
              ? "border-red-300/40 bg-red-500/20 text-red-100"
              : result.status === "healthyBand"
                ? "border-lime-300/40 bg-lime-500/20 text-lime-100"
                : "border-amber-300/40 bg-amber-500/20 text-amber-100",
          )}
        >
          {t(result.status, language)}
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs text-white/65">
              <span>{t("survival", language)}</span>
              <span className="text-lime-200">
                {Math.round(result.survivalFraction * 32)}/32 · {result.deadPercent}% dead
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-lime-300"
                style={{ width: `${result.survivalFraction * 100}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <Droplets className="mb-1 size-3 text-sky-300" />
              {result.waterScore}%<span className="block text-[.58rem] text-white/50">water</span>
            </div>
            <div>
              <Gauge className="mb-1 size-3 text-amber-300" />
              {result.nutrientScore}%<span className="block text-[.58rem] text-white/50">NPK</span>
            </div>
            <div>
              <Thermometer className="mb-1 size-3 text-orange-300" />
              {result.tempScore}%<span className="block text-[.58rem] text-white/50">thermal</span>
            </div>
          </div>
          <p className="border-t border-white/10 pt-2 text-[.62rem] text-white/55">
            {result.status === "dead"
              ? t("dead", language)
              : result.status === "moderate" || result.status === "severe"
                ? t("moderate", language)
                : t("healthyBand", language)}{" "}
            · {t("simulated", language)}
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-4 rounded-full border border-white/15 bg-slate-950/55 px-4 py-2 text-[.65rem] text-white/70 backdrop-blur-md md:flex">
        <span>
          <Wind className="mr-1 inline size-3" />{" "}
          {weather === "Current" ? `${Math.round(weatherApi?.current.wind ?? 0)} km/h` : weather}
        </span>
        <span>
          <CloudRain className="mr-1 inline size-3" /> RH {values.humidity}%
        </span>
        <span>Zone {selectedZone.replace("Z", "")}</span>
        <span>Drag to orbit · scroll to zoom</span>
      </div>
    </section>
  );
}
