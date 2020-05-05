const Web3 = require('web3');

require('dotenv').config();

const abiFile = require('../contracts/SmartWalletManager.json');


const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/935a83e2b4394aa790e1b04b14b3ebba"));

const teleCrypotPay = (ethereumAddress, contractAddress) => {
    return new web3.eth.Contract(abiFile.abi, contractAddress, {
        from: ethereumAddress,
        gasPrice: '20000000000'
    });
}

export const createWallet = async (idNumber) => {
    const telegramDeFi = teleCrypotPay(process.env.ETHEREUM_ACCOUNT, process.env.CONTRACT_ADDRESS);
    return await telegramDeFi.methods.createWallet(idNumber).call({ from: process.env.accountAddress, gas: process.env.gasLimit });
}

export const getWalletAddress = async (idNumber) => {
    const telegramDeFi = teleCrypotPay(process.env.ETHEREUM_ACCOUNT, process.env.CONTRACT_ADDRESS);
    return await telegramDeFi.methods.getWalletAddress(idNumber).call({ from: process.env.accountAddress, gas: process.env.gasLimit });
}