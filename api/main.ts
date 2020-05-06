require('dotenv').config();

import {
    getNewWallet,
    getQRcode,
    getBalance
} from './command';

const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome on TelegramDeFi'));
bot.help((ctx) => ctx.reply('telegramDeFi - V0.1'));

bot.command('getNewWallet', async (ctx) => { 
    const response = await getNewWallet(ctx.from.id);
    ctx.reply(response);
});

bot.command('getBalance', async (ctx) => {
    ctx.reply(await getBalance(ctx.from.id))
});

bot.command('getAddress', async (ctx) => {
    ctx.reply(await getNewWallet(ctx.from.id))
});

bot.command('getQRcode', async (ctx) => {
    ctx.reply(await getQRcode(ctx.from.id))
});

bot.launch();