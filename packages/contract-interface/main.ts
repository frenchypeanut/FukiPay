import { ethers } from 'ethers';

// const provider = ethers.getDefaultProvider('robsten');
const infuraProvider = new ethers.providers.InfuraProvider('ropsten');

import * as abi from './SmartWalletManager.json';

const abiFile = abi;

const address = '0x1E556730391b3e14EbB2D0cBaAf53427AE5A2C93';
const privateKey = '0x5b186f881478cc98138f39b4cdfcd58e6dd6c78554ebb4e0582315d9ca2b18e5';

const wallet = new ethers.Wallet(privateKey, infuraProvider);
const contract = new ethers.Contract(address, abiFile.abi, wallet);


const createWallet = (telegramId: string) => {
    contract.createWallet(telegramId).then((transaction: boolean) => {
        return transaction;
    });
}

const getWalletAddress = (telegramId: string) => {
    contract.getWalletAddress(telegramId).then((result: string) => {
        return result;
    });
}


console.log(createWallet('abc'));
console.log(getWalletAddress('cba'));
console.log(getWalletAddress('abc'));