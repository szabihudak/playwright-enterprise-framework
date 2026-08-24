import { type APIRequestContext } from "@playwright/test";
import { getCurrentEnvironment } from "../../utils/env";
import { AuthenticatedUser, TestUser } from "../models/User";

export class UserApiClient {
    constructor(private readonly request: APIRequestContext) {}
    async register(user:TestUser): Promise<AuthenticatedUser> {
        const { apiBaseUrl } = getCurrentEnvironment();
        const response = await this.request.post(`${apiBaseUrl}/users`, {
            data: {
              user,
            },
          });

          if (!response.ok()) {
            throw new Error(
                `User registration failed: ${response.status()} ${await response.text()}`,
            );
          }

          const body = await response.json();

          return {
            username: body.user.username,
            email: body.user.email,
            password: user.password,
            token: body.user.token,
          }
    };

    
}