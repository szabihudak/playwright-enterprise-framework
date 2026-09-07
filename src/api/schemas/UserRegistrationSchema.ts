import type { JSONSchemaType } from "ajv";
import type { UserRegistration } from "../models/UserRegistration";

export const userRegistrationSchema: JSONSchemaType<UserRegistration> = {
  type: "object",
  required: ["message", "user"],
  additionalProperties: false,

  properties: {
    message: {
      type: "string",
    },

    user: {
      type: "object",
      required: ["id", "email", "name", "createdAt"],
      additionalProperties: false,

      properties: {
        id: {
          type: "string",
        },

        email: {
          type: "string",
          format: "email",
        },

        name: {
          type: "string",
        },

        createdAt: {
          type: "string",
          format: "date-time",
        },
      },
    },
  },
};
