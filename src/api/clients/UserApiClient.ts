import { type APIRequestContext } from "@playwright/test";
import { getCurrentEnvironment } from "../../utils/env";
import { AuthenticatedUser, TestUser } from "../models/User";
import { logger } from '../../utils/logger';

export class UserApiClient {
    constructor(private readonly request: APIRequestContext) {}
    async register(user:TestUser): Promise<AuthenticatedUser> {
        logger.info(`Registering test user: ${user.username}`);
        const { apiBaseUrl } = getCurrentEnvironment();
        const response = await this.request.post(`${apiBaseUrl}/users`, {
            data: {
              user,
            },
          });

          if (!response.ok()) {
            logger.error(
              `User registration failed with status ${response.status()}`,
            );
          
            throw new Error(
              `User registration failed: ${response.status()} ${await response.text()}`,
            );
          }

          const body = await response.json();
          logger.info(`Test user registered successfully: ${body.user.username}`);
          return {
            username: body.user.username,
            email: body.user.email,
            password: user.password,
            token: body.user.token,
          }
    };

    
}