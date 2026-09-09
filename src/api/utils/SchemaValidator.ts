import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { Static, TSchema } from "@sinclair/typebox";

const ajv = new Ajv({
  allErrors: true,
});

addFormats(ajv);

export function validateSchema<T extends TSchema>(
  schema: T,
  data: unknown,
): asserts data is Static<T> {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    throw new Error(
      `Schema validation failed:\n${JSON.stringify(validate.errors, null, 2)}`,
    );
  }
}