import type { JSONSchemaType } from "ajv";
import type { Authentication } from "../models/Authentication";

export const AuthenticationSchema: JSONSchemaType<Authentication> = {
  type: "object",
  required: ["access_token", "token_type", "expires_in"],

  properties: {
    access_token: {
      type: "string",
    },

    token_type: {
      type: "string",
    },

    expires_in: {
      type: "number",
    },
  },
};