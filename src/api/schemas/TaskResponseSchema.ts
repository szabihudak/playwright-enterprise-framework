import type { JSONSchemaType } from "ajv";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskResponse,
} from "../models/Task";

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
      enum: TASK_STATUSES,
    },
    priority: {
      type: "string",
      enum: TASK_PRIORITIES,
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
