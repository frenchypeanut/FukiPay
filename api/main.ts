require('dotenv').config();

const Telegraf = require('telegraf');
const bot = new Telegraf('1165106763:AAEdLLdIS_6BcYAt1vmmZBG8ol1Rah9Z7hk');
const Web3 = require('web3');

bot.start((ctx) => ctx.reply('Welcome on TeleCryptoPay'));
bot.help((ctx) => ctx.reply('TeleCryptoPay - V0.1'));
// bot.on('test', (ctx) => ctx.reply()); 
bot.hears('createAddress', (ctx) => ctx.reply(createWallet));
bot.hears('getWalletAddress', (ctx) => ctx.reply(getWalletAddress));
bot.launch();

const contractDeployer = (contractAddress, account) => {
    const provider = new Web3.providers.WebsocketProvider('ws://' + process.env.PROVIDER);
    const TelegramDeFiJSON = require('../smart-contract/build/contracts/Ekistamp.json');
    const TelegramDeFi = contract(TelegramDeFiJSON);
    TelegramDeFi.setProvider(provider);
    const web3 = new Web3(provider);
    return new web3.eth.Contract(TelegramDeFiJSON.abi, contractAddress, { from: account });
}

const TelegramDeFi = () => { 
    contractDeployer(process.env.CONTRACT_ADDRESS, process.env.ETHEREUM_ACCOUNT);
}

const checkNewWallet = async (idNumber) => {
    const address = await getWalletAddress(idNumber);
    if(address === '0x000') {
        return true;
    }
    return false;
}

const checkWallet = async (idNumber) => {
    if (checkNewWallet(idNumber)) {
        return await createWallet(idNumber);
    }
    const address = await getWalletAddress(idNumber);
    return 'You already have a smart-wallet wich is : ' + address;
}

const getQRcode = async (idNumber) => {
    if (checkNewWallet(idNumber))  {
        return `you don't have a wallet yet, if you want to, type the following command: `;
    }
    // api call to the qrcode module
}

const getBalance = async (idNumber) => {
    if(checkNewWallet(idNumber)) {
        return `you don't have a wallet yet, if you want to, type the following command: `;
    }
    const address = await getWalletAddress(idNumber);
    return await Web3.eth.getBalance(address)
}

const createWallet = async (idNumber) => {
    const TeleCryptoPay = TelegramDeFi();
    return await TeleCryptoPay.methods.createWallet(idNumber).send({ from: process.env.accountAddress, gas: process.env.gasLimit });
}

const getWalletAddress = async (idNumber) => {
    const TeleCryptoPay = TelegramDeFi();
    return await TeleCryptoPay.methods.getWalletAddress(idNumber).call({ from: process.env.accountAddress, gas: process.env.gasLimit });
}
