import Ajv, { type JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({
  allErrors: true,
});

addFormats(ajv);

export function validateSchema<T>(
  schema: JSONSchemaType<T>,
  data: unknown,
): asserts data is T {
  const validate = ajv.compile(schema);

  const isValid = validate(data);

  if (!isValid) {
    throw new Error(
      `Schema validation failed:\n${JSON.stringify(
        validate.errors,
        null,
        2,
      )}`,
    );
  }
}