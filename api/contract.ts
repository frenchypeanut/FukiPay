const fs = require("fs");
const Web3 = require('web3');

require('dotenv').config({ path: '../.env' });

const abiFile = require('../contracts/SmartWalletManager.json');


const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/935a83e2b4394aa790e1b04b14b3ebba"));

const teleCrypotPay = new web3.eth.Contract(abiFile, '0xa08462e67646129773dd0fa04fde6fda3afdbea2', {
    from: '0xae804E83595BB4D5713B6FB656b31794c510F677',
    gasPrice: '20000000000'
});

const createWallet = async (idNumber) => {
    const TeleCryptoPay = teleCrypotPay();
    return await TeleCryptoPay.methods.createWallet(idNumber).send({ from: process.env.accountAddress, gas: process.env.gasLimit });
}

const getWalletAddress = async (idNumber) => {
    const TeleCryptoPay = teleCrypotPay();
    return await TeleCryptoPay.methods.getWalletAddress(idNumber).call({ from: process.env.accountAddress, gas: process.env.gasLimit });
}

module.exports = {
    createWallet,
    getWalletAddress
};
