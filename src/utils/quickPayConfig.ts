export interface CloudPharmacyQuickPayConfig {
  enabled: boolean;
  seconds: number;
}

const STORAGE_KEY = 'cloudPharmacyQuickPayConfig';
const DEFAULT_SECONDS = 8;
const MIN_SECONDS = 3;
const MAX_SECONDS = 30;

export const normalizeQuickPaySeconds = (value: unknown) => {
  const seconds = Math.round(Number(value));
  if (!Number.isFinite(seconds)) {
    return DEFAULT_SECONDS;
  }
  if (seconds < MIN_SECONDS) {
    return MIN_SECONDS;
  }
  if (seconds > MAX_SECONDS) {
    return MAX_SECONDS;
  }
  return seconds;
};

export const getDefaultCloudPharmacyQuickPayConfig = (): CloudPharmacyQuickPayConfig => ({
  enabled: true,
  seconds: DEFAULT_SECONDS,
});

export const getCloudPharmacyQuickPayConfig = (): CloudPharmacyQuickPayConfig => {
  const defaultConfig = getDefaultCloudPharmacyQuickPayConfig();
  if (typeof window === 'undefined') {
    return defaultConfig;
  }

  try {
    const rawConfig = window.localStorage.getItem(STORAGE_KEY);
    if (!rawConfig) {
      return defaultConfig;
    }
    const parsedConfig = JSON.parse(rawConfig);
    return {
      enabled: typeof parsedConfig?.enabled === 'boolean' ? parsedConfig.enabled : defaultConfig.enabled,
      seconds: normalizeQuickPaySeconds(parsedConfig?.seconds),
    };
  } catch {
    return defaultConfig;
  }
};

export const saveCloudPharmacyQuickPayConfig = (config: CloudPharmacyQuickPayConfig) => {
  const nextConfig = {
    enabled: Boolean(config.enabled),
    seconds: normalizeQuickPaySeconds(config.seconds),
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
  }
  return nextConfig;
};
