export type TestEnvironment = "hosted" | "local" | "ci";

export interface EnvironmentConfig {
  webBaseUrl: string;
  apiBaseUrl: string;
}

const environments: Record<TestEnvironment, EnvironmentConfig> = {
  hosted: {
    webBaseUrl: "https://dojo.upexgalaxy.com",
    apiBaseUrl: "https://dojo.upexgalaxy.com/api",
  },
  local: {
    webBaseUrl: "http://localhost:3000",
    apiBaseUrl: "http://localhost:3000/api",
  },
  ci: {
    webBaseUrl: "http://localhost:3000",
    apiBaseUrl: "http://localhost:3000/api",
  },
};

export function getEnvironmentConfig(
  environment: TestEnvironment,
): EnvironmentConfig {
  return environments[environment];
}
