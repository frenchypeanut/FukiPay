const fs = require("fs");
const Web3 = require('web3');

require('dotenv').config({ path: '../.env' });

const abiFile = require('../contracts/SmartWalletManager.json');


const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/935a83e2b4394aa790e1b04b14b3ebba"));

const teleCrypotPay = (ethereumAddress, contractAddress) => {
    return new web3.eth.Contract(abiFile.abi, contractAddress, {
        from: ethereumAddress,
        gasPrice: '20000000000'
    });
}

const createWallet = async (idNumber) => {
    const TeleCryptoPay = teleCrypotPay(process.env.ETHEREUM_ACCOUNT, process.env.CONTRACT_ADDRESS);
    return await TeleCryptoPay.methods.createWallet(idNumber).call({ from: process.env.accountAddress, gas: process.env.gasLimit });
}

const getWalletAddress = async (idNumber) => {
    const TeleCryptoPay = teleCrypotPay(process.env.ETHEREUM_ACCOUNT, process.env.CONTRACT_ADDRESS);
    return await TeleCryptoPay.methods.getWalletAddress(idNumber).call({ from: process.env.accountAddress, gas: process.env.gasLimit });
}

module.exports = {
    createWallet,
    getWalletAddress
};
