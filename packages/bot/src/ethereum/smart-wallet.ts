import { Contract, Wallet } from 'ethers';
import { abi } from '../artifacts/SmartWalletManager.json';
import provider from './provider';
import { CONTRACT_ADDRESS, OWNER_PK } from '../config';

const smartWallet = function (address, pk): any {
  const wallet = new Wallet(pk, provider);
  const contract = new Contract(address, abi, wallet);

  return {
    async create(uid: string) {
      return contract.createWallet(uid);
    },

    async getWalletAddress(uid: string) {
      return contract.getWalletAddress(uid);
    },
  };
};

export default smartWallet(CONTRACT_ADDRESS, OWNER_PK);
