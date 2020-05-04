const Web3 = require('web3');

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
