export const CONFIG = {
    API_TOKEN: '', // À configurer via l'interface
    MODEL_VERSION: '2389224e',
    BASE_URL: 'https://api.replicate.com/v1',
    DEFAULT_LORA: 'AndyVampiro/joa',
    DEFAULT_LORA_SCALE: 0.9
};

export const HISTORY_STORAGE_KEY = 'image_history';
export const MAX_HISTORY_ITEMS = 50;

const UI = {
    MAX_RETRIES: 60,
    POLL_INTERVAL: 1000,
    MAX_PROMPT_LENGTH: 500,
    DEFAULT_PARAMS: {
        aspect_ratio: '1:1',
        prompt_strength: 0.8,
        num_outputs: 1,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        output_format: 'webp',
        output_quality: 80,
        disable_safety_checker: false,
        lora_names: ['AndyVampiro/joa'],
        lora_scales: [1.0]
    },
    ASPECT_RATIOS: [
        { label: 'Carré (1:1)', value: '1:1' },
        { label: '16:9', value: '16:9' },
        { label: '21:9', value: '21:9' },
        { label: '3:2', value: '3:2' },
        { label: '2:3', value: '2:3' },
        { label: '4:5', value: '4:5' },
        { label: '5:4', value: '5:4' },
        { label: '3:4', value: '3:4' },
        { label: '4:3', value: '4:3' },
        { label: '9:16', value: '9:16' },
        { label: '9:21', value: '9:21' }
    ],
    OUTPUT_FORMATS: [
        { label: 'WEBP', value: 'webp' },
        { label: 'JPG', value: 'jpg' },
        { label: 'PNG', value: 'png' }
    ],
    RANGES: {
        quality: { min: 0, max: 100, step: 1, default: 80 },
        guidance_scale: { min: 0, max: 10, step: 0.1, default: 3.5 },
        prompt_strength: { min: 0, max: 1, step: 0.1, default: 0.8 },
        num_inference_steps: { min: 1, max: 50, step: 1, default: 28 },
        num_outputs: { min: 1, max: 4, step: 1, default: 1 },
        lora_scale: { min: 0.8, max: 1, step: 0.1, default: 1.0 }
    }
};

const THEME = {
    COLORS: {
        PRIMARY: '#6B46C1',
        PRIMARY_LIGHT: '#9F7AEA',
        PRIMARY_DARK: '#553C9A',
        BACKGROUND: '#1A1A1A',
        SURFACE: '#2D2D2D',
        TEXT: '#FFFFFF',
        TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)',
        ERROR: '#E53E3E',
        SUCCESS: '#48BB78'
    },
    FONTS: {
        TITLE: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        BODY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
};

export { UI, THEME }; 