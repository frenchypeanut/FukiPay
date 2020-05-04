const QRCode = require('qrcode');
const contract = require('./contract.ts');

const checkNewWallet = async (idNumber: string) => {
    const address = await contract.getWalletAddress(idNumber);
    if (address === '0x000') {
        return true;
    }
    return false;
}

const getWallet = async (idNumber: string) => {
    if (checkNewWallet(idNumber)) {
        return `You don't have a smart-wallet. `;
    }
    const address = await contract.getWalletAddress(idNumber);
    return 'Your smart-wallet address is : ' + address;
}

const getNewWallet = async (idNumber: string) => {
    if (checkNewWallet(idNumber)) {
        return await contract.createWallet(idNumber);
    }
    const address = await contract.getWalletAddress(idNumber);
    return 'You already have a smart-wallet wich is : ' + address;
}

const getQRcode = async (idNumber: string) => {
    if (checkNewWallet(idNumber)) {
        return `you don't have a wallet yet, if you want to, type the following command: `;
    }
    const address = await contract.getWalletAddress(idNumber);
    QRCode.toDataURL(address, (url: string, err: string) => {
        if (err) {
            return err;
        }
        return url;
    });
}

const getBalance = async (idNumber: string) => {
    if (checkNewWallet(idNumber)) {
        return `you don't have a wallet yet, if you want to, type the following command: `;
    }
    const address = await contract.getWalletAddress(idNumber);
    return await Web3.eth.getBalance(address)
}

module.exports =  {
    checkNewWallet,
    getNewWallet,
    getQRcode,
    getBalance
};