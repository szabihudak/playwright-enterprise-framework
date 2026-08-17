export type TestEnvironment = 'hosted' | 'local' | 'ci';

export interface EnvironmentConfig {
  webBaseUrl: string;
  apiBaseUrl: string;
}

const environments: Record<TestEnvironment, EnvironmentConfig> = {
  hosted: {
    webBaseUrl: '',
    apiBaseUrl: '',
  },
  local: {
    webBaseUrl: 'http://localhost:3000',
    apiBaseUrl: 'http://localhost:3001/api',
  },
  ci: {
    webBaseUrl: 'http://localhost:3000',
    apiBaseUrl: 'http://localhost:3001/api',
  },
};

export function getEnvironmentConfig(
  environment: TestEnvironment,
): EnvironmentConfig {
  return environments[environment];
}