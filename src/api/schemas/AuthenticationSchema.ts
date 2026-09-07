import type { JSONSchemaType } from "ajv";

import type { Authentication } from "../models/Authentication";

export const authenticationSchema: JSONSchemaType<Authentication> = {
  type: "object",

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

  required: ["access_token", "token_type", "expires_in"],

  additionalProperties: false,
};
