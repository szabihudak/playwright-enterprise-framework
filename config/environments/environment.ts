export type TestEnvironment = 'hosted' | 'local' | 'ci';

export interface EnvironmentConfig {
  webBaseUrl: string;
  apiBaseUrl: string;
}

const environments: Record<TestEnvironment, EnvironmentConfig> = {
  hosted: {
    webBaseUrl: 'https://conduit-realworld-example-app.fly.dev',
    apiBaseUrl: 'https://conduit-realworld-example-app.fly.dev/api',
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