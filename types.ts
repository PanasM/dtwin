// Глобальні типи для симуляції

export enum ScenarioType {
    COLD_STORAGE = 'COLD_STORAGE',
    LOW_TEMP = 'LOW_TEMP',
    TEMP_ABUSE = 'TEMP_ABUSE',
    FLUCTUATION = 'FLUCTUATION',
    VACUUM = 'VACUUM',
}

export interface SimulationConfig {
    id: ScenarioType;
    name: string;
    description: string;
    initialTemp: number;     // Початкова температура продукту (°C)
    targetEnvTemp: number;   // Цільова температура середовища (°C)
    baseHumidity: number;    // Базова вологість середовища (%)
    tempFluctuation: number; // Амплітуда коливань температури (+/- °C)
    tempSpikeHour?: number;  // Час (година) коли стається збій температури (опціонально)
    tempSpikeValue?: number; // Значення температури під час збою
    packagingFactor: number; // Коефіцієнт захисту пакування (0-1, де 0 - вакуум/ідеал, 1 - відкрите)
    durationHours: number;   // Тривалість симуляції
}

export interface SimulationStep {
    time: number;       // Час у годинах
    tEnv: number;       // Температура середовища
    tProd: number;      // Температура продукту
    humidity: number;   // Вологість середовища (%)
    microbes: number;   // Кількість бактерій (CFU/g) - log10 або натуральне
    moisture: number;   // Вміст вологи у продукті (%)
    protein: number;    // Вміст білка (%) - індекс цілісності
    fatOxidation: number; // Окиснення жирів (індекс)
    qualityIndex: number; // Інтегральний індекс Q(t) (0-1, де 0 - зіпсовано, 1 - свіже)
}

export interface SimulationResult {
    config: SimulationConfig;
    data: SimulationStep[];
    spoilageTime: number | null; // Час, коли продукт зіпсувався (якщо сталося)
}