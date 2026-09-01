import { test, expect } from "../../src/fixtures/test-fixtures";
import { LoginCredentials } from "../../src/api/models/LoginCredentials";

type MissingFieldScenario = {
  name: string;
  missingField: keyof LoginCredentials;
};

const user = {
  name: 'qa_1788252573258-gd22q8',
  email: 'qa_1788252573258-gd22q8@example.com',
  password: 'TestPassword123!'
}

const emptyFieldScenarios = [
  {
    name: "rejects an empty email",
    statusCode: 400,
    overrides: {email:"", password:user.password},
    expectedMessage: "Invalid email or password format",
  },
  {
    name: "rejects an empty password",
    statusCode: 400,
    overrides: {email:user.email, password:""},
    expectedMessage: "Invalid email or password format",
  },
  {
    name: "reject an known user with malformed email",
    statusCode: 400,
    overrides: {email:"user.com", password:user.password},
    expectedMessage: "Invalid email or password format",
  },
  {
    name: "reject a valid user with wrong password",
    statusCode: 401,
    overrides: {email:user.email, password:"asdf1234"},
    expectedMessage: "Invalid credentials",
  },
  {
    name: "reject an unknown user with wrong password",
    statusCode: 401,
    overrides: {email:"somebody@gmail.com", password:"asdf1234"},
    expectedMessage: "Invalid credentials",
  },
  {
    name: "rejects an missing email",
    statusCode: 400,
    overrides: {password:user.password},
    expectedMessage: "Invalid email or password format",
  },
  {
    name: "rejects an missing password",
    statusCode: 400,
    overrides: {email:user.email},
    expectedMessage: "Invalid email or password format",
  }, 
];

test.describe("User Authentication API", () => {
  test("authenticate a valid user", async ({ userApi, registeredTestUser }) => {
    //const user = ;
    //console.log(user);
    const response = await userApi.login(user);
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(200);
    expect(body.access_token).toBeTruthy();
    expect(body.token_type).toBe("Bearer");
    expect(body.expires_in).toBe(86400);
  });


  for (const scenario of emptyFieldScenarios) {
    test(scenario.name, async ({ userApi }) => {
      const response = await userApi.login(scenario.overrides);
      const body = await response.json();
      expect(response.status()).toBe(scenario.statusCode);
      expect(body.error).toBe(scenario.expectedMessage);
    });
  }
});
