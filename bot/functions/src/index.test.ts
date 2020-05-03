import functions from "firebase-functions-test";

const testEnv = functions();
testEnv.mockConfig({ bot: { token: "" } });
const myFunctions = require("../src/index.ts");

describe("load without crashing", () => {
  test("no crash", () => {
    const req = {
      body: {},
    };

    const res = {};

    myFunctions.webhook(req as any, res as any);
  });
});
