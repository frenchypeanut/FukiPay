import { Contract, Wallet } from 'ethers';
import { abi } from '../artifacts/SmartWalletManager.json';
import provider from './provider';
import { CONTRACT_ADDRESS, OWNER_PK } from '../config';

const smartWallet = ((_address, _pk): any => {
  const wallet = new Wallet(_pk, provider);
  const contract = new Contract(_address, abi, wallet);

  return {
    async create(uid: string) {
      return contract.createWallet(uid);
    },

    async getWalletAddress(uid: string) {
      return contract.getWalletAddress(uid);
    },

    async getWalletBalance(uid: string) {
      const address = await smartWallet.getWalletAddress(uid);

      return provider.getBalance(address);
    },
  };
})(CONTRACT_ADDRESS, OWNER_PK);

export default smartWallet;
