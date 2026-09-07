import type { JSONSchemaType } from "ajv";
import type { CurrentUser } from "../models/CurrentUser";

export const currentUserSchema: JSONSchemaType<CurrentUser> = {
  type: "object",
  required: ["user"],
  additionalProperties: false,

  properties: {
    user: {
      type: "object",
      required: ["id", "email", "name", "createdAt", "updatedAt"],
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

        updatedAt: {
          type: "string",
          format: "date-time",
        },
      },
    },
  },
};
