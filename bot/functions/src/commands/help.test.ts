import Telegraf, { Context } from "telegraf";
import setupHelp from "./help";

const bot: Telegraf<Context> = new Telegraf("");
const command = (bot.command = jest.fn());

describe("test [start, help]", () => {
  it("matches text", () => {
    command.mockImplementation((cmd, mw) => {
      expect(cmd).toStrictEqual(["/start", "/help"]);
    });
    setupHelp(bot);
    expect(command).toHaveBeenCalledTimes(1);
  });
});
