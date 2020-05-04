require('dotenv').config({ path: '../.env' });
const command = require('./command.ts');

const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome on TeleCryptoPay'));
bot.help((ctx) => ctx.reply('TeleCryptoPay - V0.1'));

bot.command('test', (ctx) => ctx.reply('ok'));
bot.command('ok', (ctx) => ctx.reply(command.ok(ctx.from.id)));


bot.command('getNewWallet', (ctx) => ctx.reply(command.getNewWallet(ctx.from.id)));
bot.command('getBalance', (ctx) => ctx.reply(command.getBalance(ctx.from.id)));
bot.command('getAddress', (ctx) => ctx.reply(command.getNewWallet(ctx.from.id)));
bot.command('getQRcode', (ctx) => ctx.reply(command.getQRcode(ctx.from.id)));
bot.launch();