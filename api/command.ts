const QRCode = require('qrcode');
const contract = require('./contract.ts');

const ok = (idNumber) => {
    return 'bonjour, ' + idNumber;
}

const checkNewWallet = async (idNumber) => {
    const address = await contract.getWalletAddress(idNumber);
    if (address === '0x000') {
        return true;
    }
    return false;
}

const getNewWallet = async (idNumber) => {
    if (checkNewWallet(idNumber)) {
        return await contract.createWallet(idNumber);
    }
    const address = await contract.getWalletAddress(idNumber);
    return 'You already have a smart-wallet wich is : ' + address;
}

const getWallet = async (idNumber) => {
    if (checkNewWallet(idNumber)) {
        return `You don't have a smart-wallet. `;
    }
    const address = await contract.getWalletAddress(idNumber);
    return 'Your smart-wallet address is : ' + address;
}

const getQRcode = async (idNumber) => {
    if (checkNewWallet(idNumber)) {
        return `you don't have a wallet yet, if you want to, type the following command: `;
    }
    const address = await contract.getWalletAddress(idNumber);
    QRCode.toDataURL(address, (url, err) => {
        if (err) {
            return err;
        }
        return url;
    });
}

const getBalance = async (idNumber) => {
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
    getBalance,
    ok
};

// renvoyer l'url de la transaction du smart-contract sur idex