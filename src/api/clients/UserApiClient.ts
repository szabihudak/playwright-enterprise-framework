import { type APIRequestContext, type APIResponse } from "@playwright/test";

import { getCurrentEnvironment } from "../../utils/env";
import type { LoginCredentials } from "../models/LoginCredentials";
import type { AuthenticatedUser, TestUser } from "../models/User";
import type { TaskRequest, TaskResponse } from "../models/Task";
import { logger } from "../../utils/logger";

type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export class UserApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async register(user: Partial<TestUser>): Promise<APIResponse> {
    const { apiBaseUrl } = getCurrentEnvironment();

    return this.request.post(`${apiBaseUrl}/auth/register`, {
      data: {
        ...user,
      },
    });
  }

  async login(credentials: Partial<LoginCredentials>): Promise<APIResponse> {
    const { apiBaseUrl } = getCurrentEnvironment();

    return this.request.post(`${apiBaseUrl}/auth/login`, {
      data: {
        ...credentials,
      },
    });
  }

  async getCurrentUser(accessToken?: string): Promise<APIResponse> {
    const { apiBaseUrl } = getCurrentEnvironment();

    return this.request.get(`${apiBaseUrl}/auth/me`, {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    });
  }

  async registerUser(user: TestUser): Promise<TestUser> {
    logger.info(`Registering test user: ${user.email}`);
    const registrationResponse = await this.register(user);
    if (!registrationResponse.ok()) {
      logger.error(
        `User registration failed with status ${registrationResponse.status()}`,
      );
      throw new Error(
        `User registration failed: ${registrationResponse.status()} ${await registrationResponse.text()}`,
      );
    }
    logger.info(`Test user registered successfully: ${user.email}`);
    return {
      ...user,
    };
  }

  async createTask(
    task: TaskRequest,
    accessToken: string,
  ): Promise<APIResponse> {
    const { apiBaseUrl } = getCurrentEnvironment();

    return this.request.post(`${apiBaseUrl}/tasks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        ...task,
      },
    });
  }

  async createTaskForUser(
    task: TaskRequest,
    accessToken: string,
  ): Promise<TaskResponse> {
    logger.info(`Creating a new task: ${task.title}`);

    const response = await this.createTask(task, accessToken);

    if (!response.ok()) {
      logger.error(`Task creation failed with status ${response.status()}`);

      throw new Error(
        `Task creation failed: ${response.status()} ${await response.text()}`,
      );
    }

    const createdTask = (await response.json()) as TaskResponse;

    if (!createdTask.id) {
      throw new Error(
        "Task creation failed: response does not contain task id",
      );
    }

    logger.info(`Task created successfully: ${task.title}`);

    return createdTask;
  }

  async registerAndAuthenticateUser(
    user: TestUser,
  ): Promise<AuthenticatedUser> {
    logger.info(`Registering test user: ${user.email}`);
    user = await this.registerUser(user);
    const loginResponse = await this.login(user);
    if (!loginResponse.ok()) {
      logger.error(`User login failed with status ${loginResponse.status()}`);
      throw new Error(
        `User login failed: ${loginResponse.status()} ${await loginResponse.text()}`,
      );
    }
    const body = (await loginResponse.json()) as LoginResponse;
    logger.info(`Test user logged in successfully: ${user.email}`);
    return {
      ...user,
      accessToken: body.access_token,
    };
  }
}
