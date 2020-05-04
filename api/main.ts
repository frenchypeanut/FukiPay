require('dotenv').config({ path: '../.env' });
const command = require('./command.ts');

const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome on TeleCryptoPay'));
bot.help((ctx) => ctx.reply('TeleCryptoPay - V0.1'));
// bot.on('test', (ctx) => ctx.reply()); 
bot.hears('getNewWallet', (ctx) => ctx.reply(getNewWallet));
bot.hears('getBalance', (ctx) => ctx.reply(getBalance));
bot.hears('getAddress', (ctx) => ctx.reply(getNewWallet));
bot.hears('getQRcode', (ctx) => ctx.reply(getQRcode));
bot.launch();