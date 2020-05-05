require('dotenv').config({ path: '../.env' });

import {
    getNewWallet,
    getQRcode,
    getBalance
} from './command';

const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome on telegramDeFi'));
bot.help((ctx) => ctx.reply('telegramDeFi - V0.1'));

bot.command('getNewWallet', (ctx) => ctx.reply(getNewWallet(ctx.from.id)));
bot.command('getBalance', (ctx) => ctx.reply(getBalance(ctx.from.id)));
bot.command('getAddress', (ctx) => ctx.reply(getNewWallet(ctx.from.id)));
bot.command('getQRcode', (ctx) => ctx.reply(getQRcode(ctx.from.id)));

bot.launch();