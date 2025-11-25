import { ScenarioType, SimulationConfig } from '../types';

export const scenarios: SimulationConfig[] = [
    {
        id: ScenarioType.COLD_STORAGE,
        name: "Стандартне Холодне Зберігання",
        description: "Ідеальні умови при +4°C. Стандартний режим побутового холодильника.",
        initialTemp: 10,
        targetEnvTemp: 4,
        baseHumidity: 85,
        tempFluctuation: 0.5,
        packagingFactor: 0.8, // Звичайне пакування
        durationHours: 168 // 7 днів
    },
    {
        id: ScenarioType.LOW_TEMP,
        name: "Супер-Охолодження (Superchilling)",
        description: "Зберігання на межі замерзання (0...1°C). Максимальне збереження свіжості без заморозки.",
        initialTemp: 4,
        targetEnvTemp: 0.5,
        baseHumidity: 85,
        tempFluctuation: 0.2,
        packagingFactor: 0.8,
        durationHours: 240 // 10 днів
    },
    {
        id: ScenarioType.TEMP_ABUSE,
        name: "Порушення Температурного Режиму",
        description: "Холодильник зламався або двері залишили відчиненими. Стрибок до +15°C на 12-й годині.",
        initialTemp: 4,
        targetEnvTemp: 4,
        baseHumidity: 85,
        tempFluctuation: 0.5,
        tempSpikeHour: 12,
        tempSpikeValue: 15,
        packagingFactor: 0.8,
        durationHours: 72 // 3 дні
    },
    {
        id: ScenarioType.VACUUM,
        name: "Вакуумне Пакування",
        description: "Відсутність повітря сповільнює окиснення жирів та втрату вологи.",
        initialTemp: 4,
        targetEnvTemp: 4,
        baseHumidity: 85,
        tempFluctuation: 0.5,
        packagingFactor: 0.05, // Майже ідеальний бар'єр
        durationHours: 336 // 14 днів
    },
    {
        id: ScenarioType.FLUCTUATION,
        name: "Нестабільний Холод (Коливання)",
        description: "Старий холодильник із великим гістерезисом. Температура постійно 'гуляє'.",
        initialTemp: 4,
        targetEnvTemp: 6, // Середня вище норми
        baseHumidity: 80,
        tempFluctuation: 1.0, // Додатковий шум обробляється логікою синусоїди в моделі
        packagingFactor: 0.8,
        durationHours: 120 // 5 днів
    }
];