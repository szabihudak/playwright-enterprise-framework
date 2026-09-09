import Ajv, {
  type AnySchema,
  type JSONSchemaType,
} from "ajv";
import addFormats from "ajv-formats";
import type { Static, TSchema } from "@sinclair/typebox";

const ajv = new Ajv({
  allErrors: true,
});

addFormats(ajv);

export function validateSchema<T>(
  schema: JSONSchemaType<T>,
  data: unknown,
): asserts data is T;

export function validateSchema<T extends TSchema>(
  schema: T,
  data: unknown,
): asserts data is Static<T>;

export function validateSchema(
  schema: AnySchema | TSchema,
  data: unknown,
): void {
  const validate = ajv.compile(schema as AnySchema);

  const isValid = validate(data);

  if (!isValid) {
    throw new Error(
      `Schema validation failed:\n${JSON.stringify(validate.errors, null, 2)}`,
    );
  }
}