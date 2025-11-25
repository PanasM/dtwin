import { SimulationConfig, SimulationStep } from '../types';

// Константи моделі
const DT = 0.5; // Крок часу в годинах
const INITIAL_MICROBES = 1000; // Початкова кількість бактерій (CFU/g)
const MAX_MICROBES = 100000000; // Максимальна ємність середовища
const SPOILAGE_THRESHOLD = 10000000; // Поріг псування (10^7 CFU/g)
const INITIAL_MOISTURE = 74.0; // %
const INITIAL_PROTEIN = 100.0; // % (відносний)
const INITIAL_FAT_QUALITY = 100.0; // % (відносний)

// Константи рівняння Арреніуса та росту
const E_A = 80000; // Енергія активації (Дж/моль) - приклад
const R = 8.314;   // Газова стала
const REF_K = 0.4; // Константа швидкості при референсній температурі

// Допоміжна функція генерації шуму
const noise = (amplitude: number) => (Math.random() - 0.5) * 2 * amplitude;

/**
 * Розрахунок швидкості росту мікроорганізмів (спрощена модель Ратковського/Арреніуса)
 * @param temp Температура в градусах Цельсія
 */
const getGrowthRate = (temp: number): number => {
    // Емпірична модель: ріст дуже повільний при 0°C, швидкий при 20-30°C
    if (temp < -2) return 0;
    // Модифікований Арреніус для біології (спрощено)
    const T_kelvin = temp + 273.15;
    const baseRate = 0.05 * Math.exp(0.12 * temp); 
    return baseRate;
};

/**
 * Закон охолодження Ньютона
 */
const getTempChange = (currentTemp: number, envTemp: number): number => {
    const k_cool = 0.3; // Коефіцієнт теплообміну
    return -k_cool * (currentTemp - envTemp);
};

/**
 * Втрата вологи (дифузія)
 */
const getMoistureLoss = (currentMoisture: number, envHum: number, packagingFactor: number): number => {
    // Чим менша вологість середовища і гірше пакування, тим швидше сохне
    // packagingFactor: 0.05 (вакуум), 1.0 (відкрите)
    const drivingForce = (currentMoisture - (envHum / 2)); // Спрощена рушійна сила
    if (drivingForce <= 0) return 0;
    const k_dry = 0.005 * packagingFactor;
    return -k_dry * drivingForce;
};

/**
 * Хімічна деградація (Білки/Жири)
 */
const getChemicalDecay = (temp: number, type: 'protein' | 'fat', packagingFactor: number): number => {
    const T_kelvin = temp + 273.15;
    // Жири окислюються швидше при наявності кисню (packagingFactor)
    const oxygenFactor = type === 'fat' ? (0.2 + 0.8 * packagingFactor) : 1.0;
    
    // Арреніус
    const k = Math.exp(-4000 / T_kelvin) * 10000 * oxygenFactor; 
    
    // Нормалізація для масштабу симуляції
    return type === 'protein' ? k * 0.01 : k * 0.05;
};

export const runSimulation = (config: SimulationConfig): SimulationStep[] => {
    const steps: SimulationStep[] = [];
    let currentTime = 0;
    
    // Початковий стан
    let state = {
        tEnv: config.targetEnvTemp,
        tProd: config.initialTemp,
        microbes: INITIAL_MICROBES,
        moisture: INITIAL_MOISTURE,
        protein: INITIAL_PROTEIN,
        fat: INITIAL_FAT_QUALITY,
    };

    while (currentTime <= config.durationHours) {
        // 1. Генерація умов середовища (Віртуальні сенсори)
        let currentEnvTemp = config.targetEnvTemp + noise(config.tempFluctuation);
        let currentHumidity = config.baseHumidity + noise(5); // Базова вологість з конфігу

        // Обробка сценарію "Температурний збій"
        if (config.tempSpikeHour && config.tempSpikeValue) {
            if (currentTime >= config.tempSpikeHour && currentTime <= config.tempSpikeHour + 4) {
                 currentEnvTemp = config.tempSpikeValue + noise(0.5);
            }
        }

        // Обробка сценарію "Циклічні коливання" (синусоїда)
        if (config.id === 'FLUCTUATION') {
            currentEnvTemp += 3 * Math.sin(currentTime * 0.5);
        }

        // 2. Розрахунок змін (Диференціальні рівняння)
        
        // Температура продукту (dT/dt)
        const dTemp = getTempChange(state.tProd, currentEnvTemp) * DT;
        const newTProd = state.tProd + dTemp;

        // Ріст бактерій (Логістичний ріст: dN/dt)
        const mu = getGrowthRate(newTProd);
        // Logistic factor: (1 - N / N_max)
        const logisticFactor = 1 - (state.microbes / MAX_MICROBES);
        const dMicrobes = (mu * state.microbes * logisticFactor) * DT;
        const newMicrobes = Math.max(state.microbes + dMicrobes, INITIAL_MICROBES);

        // Втрата вологи
        const dMoisture = getMoistureLoss(state.moisture, currentHumidity, config.packagingFactor) * DT;
        const newMoisture = state.moisture + dMoisture;

        // Розпад білків
        const dProtein = -getChemicalDecay(newTProd, 'protein', config.packagingFactor) * state.protein * DT;
        const newProtein = state.protein + dProtein;

        // Окиснення жирів
        const dFat = -getChemicalDecay(newTProd, 'fat', config.packagingFactor) * state.fat * DT;
        const newFat = state.fat + dFat;

        // 3. Інтегральний індекс якості Q(t)
        // Спрощена формула: зважена сума відхилень. 1.0 - ідеал, 0.0 - жах.
        // Основний вклад дають бактерії.
        const microbeIndex = Math.max(0, 1 - (Math.log10(newMicrobes) - Math.log10(INITIAL_MICROBES)) / (Math.log10(SPOILAGE_THRESHOLD) - Math.log10(INITIAL_MICROBES)));
        const chemicalIndex = (newProtein + newFat) / 200; // Середнє між білком і жиром (0-1)
        
        // Q сильно падає, якщо бактерій багато
        const Q = microbeIndex * 0.8 + chemicalIndex * 0.2; 

        // Оновлення стану
        state = {
            tEnv: currentEnvTemp,
            tProd: newTProd,
            microbes: newMicrobes,
            moisture: newMoisture,
            protein: newProtein,
            fat: newFat
        };

        steps.push({
            time: Number(currentTime.toFixed(1)),
            tEnv: Number(currentEnvTemp.toFixed(2)),
            tProd: Number(state.tProd.toFixed(2)),
            humidity: Number(currentHumidity.toFixed(1)),
            microbes: Number(state.microbes.toFixed(0)),
            moisture: Number(state.moisture.toFixed(2)),
            protein: Number(state.protein.toFixed(2)),
            fatOxidation: Number((100 - state.fat).toFixed(2)), // Показуємо відсоток окиснення, а не залишку
            qualityIndex: Number(Math.max(0, Q).toFixed(2))
        });

        currentTime += DT;
    }

    return steps;
};