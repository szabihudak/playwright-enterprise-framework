import {
    type APIRequestContext,
    type APIResponse,
  } from '@playwright/test';
  
  import { getCurrentEnvironment } from '../../utils/env';
  import type {
    AuthenticatedUser,
    TestUser,
  } from '../models/User';
  import { logger } from '../../utils/logger';
  
  type LoginResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  
  export class UserApiClient {
    constructor(
      private readonly request: APIRequestContext,
    ) {}
  
    async register(user: TestUser): Promise<APIResponse> {
      const { apiBaseUrl } = getCurrentEnvironment();
  
      return this.request.post(
        `${apiBaseUrl}/auth/register`,
        {
          data: {
            name: user.name,
            email: user.email,
            password: user.password,
          },
        },
      );
    }
  
    async login(user: TestUser): Promise<APIResponse> {
      const { apiBaseUrl } = getCurrentEnvironment();
  
      return this.request.post(
        `${apiBaseUrl}/auth/login`,
        {
          data: {
            email: user.email,
            password: user.password,
          },
        },
      );
    }
  
    async registerTestUser(
      user: TestUser,
    ): Promise<AuthenticatedUser> {
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
  
      logger.info(
        `Test user registered successfully: ${user.email}`,
      );
  
      const loginResponse = await this.login(user);
  
      if (!loginResponse.ok()) {
        logger.error(
          `User login failed with status ${loginResponse.status()}`,
        );
  
        throw new Error(
          `User login failed: ${loginResponse.status()} ${await loginResponse.text()}`,
        );
      }
  
      const body = (await loginResponse.json()) as LoginResponse;
  
      logger.info(
        `Test user logged in successfully: ${user.email}`,
      );
  
      return {
        ...user,
        accessToken: body.access_token,
      };
    }
  }