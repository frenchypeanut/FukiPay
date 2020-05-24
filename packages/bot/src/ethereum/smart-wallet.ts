import { Contract, utils, Wallet } from 'ethers';
import { abi as managerABI } from '../artifacts/SmartWalletManager.json';
import { abi as walletABI } from '../artifacts/UserSmartWallet.json';
import { abi as daiABI } from '../artifacts/Dai.json';
import aTokenABI from '../ABIs/AToken.json';
import provider from './provider';
import {
  CONTRACT_ADDRESS_MANAGER,
  CONTRACT_ADDRESS_DAI,
  CONTRACT_ADDRESS_ADAI,
  OWNER_PK,
} from '../config';

const smartWallet = ((): any => {
  const wallet = new Wallet(OWNER_PK, provider);
  const managerContract = new Contract(CONTRACT_ADDRESS_MANAGER, managerABI, wallet);
  const daiContract = new Contract(CONTRACT_ADDRESS_DAI, daiABI, wallet);
  const aDaiContract = new Contract(CONTRACT_ADDRESS_ADAI, aTokenABI, wallet);

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

    async send(uid: string, to: string, _amount: number, token: string) {
      const address = await smartWallet.getAddress(uid);
      const contract = new Contract(address, walletABI, wallet);

      switch (token) {
        case 'ETH': {
          const amount = utils.parseEther(`${_amount}`);

          return contract.transferETH(to, amount);
        }
        case 'DAI': {
          return contract.transferDAItoken(CONTRACT_ADDRESS_DAI, to, _amount);
        }
      }
    },

    async getBalanceDai(uid: string) {
      const address = await smartWallet.getAddress(uid);
      const dai = await daiContract.balanceOf(address);

      return dai.toString() / 1e18;
    },

    async getBalanceADai(uid: string) {
      const address = await smartWallet.getAddress(uid);
      const aDai = await aDaiContract.balanceOf(address);

      return aDai.toString() / 1e18;
    },

    async depositDaiAave(uid: string, amount: number) {
      const address = await smartWallet.getAddress(uid);
      const contract = new Contract(address, walletABI, wallet);
      const tx = await contract.depositFundsAave(
        CONTRACT_ADDRESS_DAI,
        utils.parseEther(`${amount}`),
        {
          gasLimit: 1000000,
          gasPrice: utils.parseUnits('9.0', 'gwei'),
        },
      );
      console.log(tx);
    },
  };
})();

export default smartWallet;
