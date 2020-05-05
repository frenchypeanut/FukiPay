const Web3 = require('web3');

require('dotenv').config();

const abiFile = require('../contracts/SmartWalletManager.json');

let HDWalletProvider = require('truffle-hdwallet-provider')
const provider = new HDWalletProvider("notice sure hockey vacant youth deer grass case vocal plate rather swear", "https://ropsten.infura.io/v3/qwe");
const web3 = new Web3(provider);

const TelegramDeFi = (ethereumAddress, contractAddress) => {
    web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    return new web3.eth.Contract(abiFile.abi, contractAddress, {
        from: ethereumAddress,
        gasPrice: '20000000000'
    });
}

export const createWallet = async (idNumber) => {
    const telegramDeFi = TelegramDeFi(process.env.ETHEREUM_ACCOUNT, process.env.CONTRACT_ADDRESS);
    const tx = await telegramDeFi.methods.createWallet(idNumber).send({ from: process.env.accountAddress });
    return true;
}

export const getWalletAddress = async (idNumber) => {
    const telegramDeFi = TelegramDeFi(process.env.ETHEREUM_ACCOUNT, process.env.CONTRACT_ADDRESS);
    const tx = await telegramDeFi.methods.getWalletAddress(idNumber).call({ from: process.env.accountAddress });
    return(tx);
}