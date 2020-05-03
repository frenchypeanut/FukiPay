import Telegraf, { Context } from "telegraf";
import setupStart from "./start";

const bot: Telegraf<Context> = new Telegraf("");
const start = (bot.start = jest.fn());

describe("test start", () => {
  it("matches text", () => {
    setupStart(bot);
    expect(start).toHaveBeenCalledTimes(1);
  });
});
