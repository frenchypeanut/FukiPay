require('dotenv').config();

const Telegraf = require('telegraf');
const bot = new Telegraf('1085772445:AAEUdMIocKWwdK40vEAd-s1-c21A3LZGlG8');
const Web3 = require('web3');

bot.start((ctx) => ctx.reply('Welcome on TeleCryptoPay'));
bot.help((ctx) => ctx.reply('TeleCryptoPay - V0.1'));
// bot.on('test', (ctx) => ctx.reply()); 
bot.hears('createAddress', (ctx) => ctx.reply(createWallet));
bot.hears('getWalletAddress', (ctx) => ctx.reply(getWalletAddress));
bot.launch();

const contractDeployer = (contractAddress, account, provider) => {
    const TelegramDeFiJSON = require('../smart-contract/build/contracts/Ekistamp.json');
    const TelegramDeFi = contract(TelegramDeFiJSON);
    TelegramDeFi.setProvider(provider);
    const web3 = new Web3(provider);
    return new web3.eth.Contract(TelegramDeFiJSON.abi, contractAddress, { from: account });
}

const TelegramDeFi = () => { 
    contractDeployer(CONTRACT_ADDRESS, ETHEREUM_ACCOUNT, provider);
}

const createWallet = async (phoneNumber) => {
    const TeleCryptoPay = TelegramDeFi();
    return await TeleCryptoPay.methods.createWallet(phoneNumber).send({ from: state.accountAddress, gas: state.gasLimit });
}

const getWalletAddress = async (phoneNumber) => {
    const TeleCryptoPay = TelegramDeFi();
    return await TeleCryptoPay.methods.getWalletAddress(phoneNumber).call({ from: state.accountAddress, gas: state.gasLimit });
}