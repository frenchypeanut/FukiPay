// const ethers = require('ethers');



const Web3 = require('web3');
const fs = require('fs');

const deploy = () => {
    const web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
    const source = fs.readFileSync("../contract/contracts.json");
    const contracts = JSON.parse(source)["contracts"];
    const abi = JSON.parse(contracts.SampleContract.abi);
    const code = '0x' + contracts.SampleContract.bin;
    const SampleContract = web3.eth.contract(abi);
}

// const contractDeployer = (contractAddress, account) => {
//     const provider = new Web3.providers.WebsocketProvider('ws://' + process.env.PROVIDER);
//     const TelegramDeFiJSON = require('../smart-contract/build/contracts/TelegramDeFi.json');
//     const TelegramDeFi = contract(TelegramDeFiJSON);
//     TelegramDeFi.setProvider(provider);
//     const web3 = new Web3(provider);
//     return new web3.eth.Contract(TelegramDeFiJSON.abi, contractAddress, { from: account });
// }

const TelegramDeFi = contractDeployer(process.env.CONTRACT_ADDRESS, process.env.ETHEREUM_ACCOUNT);


const createWallet = async (idNumber) => {
    const TeleCryptoPay = TelegramDeFi();
    return await TeleCryptoPay.methods.createWallet(idNumber).send({ from: process.env.accountAddress, gas: process.env.gasLimit });
}

const getWalletAddress = async (idNumber) => {
    const TeleCryptoPay = TelegramDeFi();
    return await TeleCryptoPay.methods.getWalletAddress(idNumber).call({ from: process.env.accountAddress, gas: process.env.gasLimit });
}

module.exports = {
    createWallet,
    getWalletAddress
};
