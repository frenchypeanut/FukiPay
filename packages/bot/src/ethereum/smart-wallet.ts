import { Contract, Wallet } from 'ethers';
import { abi as managerABI } from '../artifacts/SmartWalletManager.json';
import { abi as daiABI } from '../artifacts/Dai.json';
import provider from './provider';
import { CONTRACT_ADDRESS_MANAGER, CONTRACT_ADDRESS_DAI, OWNER_PK } from '../config';

const smartWallet = ((): any => {
  const wallet = new Wallet(OWNER_PK, provider);
  const managerContract = new Contract(CONTRACT_ADDRESS_MANAGER, managerABI, wallet);
  const daiContract = new Contract(CONTRACT_ADDRESS_DAI, daiABI, wallet);

  return {
    async create(uid: string) {
      return managerContract.createWallet(uid);
    },

    async getAddress(uid: string) {
      return managerContract.getWalletAddress(uid);
    },

    async getBalance(uid: string) {
      const address = await smartWallet.getAddress(uid);

      return provider.getBalance(address);
    },
    async getBalanceDai(uid: string) {
      const address = await smartWallet.getAddress(uid);
      const dai = await daiContract.balanceOf(address);

      return dai.toString() / 1e18;
    },
  };
})();

export default smartWallet;
