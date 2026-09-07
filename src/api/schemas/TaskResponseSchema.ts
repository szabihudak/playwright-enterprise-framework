import type { JSONSchemaType } from "ajv";
import type { TaskResponse } from "../models/Task";

export const taskResponseSchema: JSONSchemaType<TaskResponse> = {
  type: "object",

  properties: {
    id: {
      type: "string",
    },
    userId: {
      type: "string",
    },
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    status: {
      type: "string",
      enum: ["backlog", "in_progress", "done"],
    },
    priority: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    position: {
      type: "number",
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

  required: [
    "id",
    "userId",
    "title",
    "description",
    "status",
    "priority",
    "position",
    "createdAt",
    "updatedAt",
  ],

  additionalProperties: false,
};
