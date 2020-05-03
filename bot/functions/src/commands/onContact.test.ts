import Telegraf, { Context } from "telegraf";
import setupOnContact from "./onContact";

const bot: Telegraf<Context> = new Telegraf("");
const on = (bot.on = jest.fn());

describe("test on contact", () => {
  it("matches text", () => {
    on.mockImplementation((updateType, mw) => {
      expect(updateType).toStrictEqual("contact");
    });
    setupOnContact(bot);
    expect(on).toHaveBeenCalledTimes(1);
  });
});
