const QRCode = require('qrcode');
const contract = require('./contract.ts');

/** 
 * @dev Check if the user have already a wallet.
 * @param idNumber Id of the user.
 * @return boolean The confirmation of the existence of the wallet.
 */
const checkNewWallet = async (idNumber) => {
    const address = await contract.getWalletAddress(idNumber);
    if (address === '0x000') {
        return true;
    }
    return false;
}

/**
 * @dev Give the url of the transaction.
 * @param tx Id of the transaction
 * @return string The url of the transaction.
 */
const getEtherscanUrl = (tx) => {
    const msg = 'you can find the details of your transaction at this url: https://etherscan.io/tx/'+ tx;
    return msg;
}

/**
 * @dev Generate new smart-wallet.
 * @param idNumber Id of the user.
 * @return string The address of the new wallet.
 */
const getNewWallet = async (idNumber) => {
    if (checkNewWallet(idNumber)) {
        return await contract.createWallet(idNumber);
    }
    const address = await contract.getWalletAddress(idNumber);
    return 'You already have a smart-wallet wich is : ' + address;
}

/**
 * @dev Get the address of the user's wallet.
 * @param idNumber Id of the user.
 * @return string The address of the user's wallet.
 */
const getWallet = async (idNumber) => {
    if (checkNewWallet(idNumber)) {
        return `You don't have a smart-wallet.`;
    }
    const address = await contract.getWalletAddress(idNumber);
    return 'Your smart-wallet address is : ' + address;
}

/**
 * @dev Get the address of the user's wallet in qrcode format.
 * @param idNumber Id of the user.
 * @return string The url of the qrcode.
 */
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

/**
 * @dev Get the balance's user.
 * @param idNumber Id of the user.
 * @return int The value of the wallet's user.
 */
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
    getBalance
};
