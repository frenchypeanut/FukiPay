import { ethers } from '@nomiclabs/buidler';
import { Signer, Wallet } from 'ethers';
import chai from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import SmartWalletManagerArtifact from '../artifacts/SmartWalletManager.json';
import { SmartWalletManager } from '../typechain/SmartWalletManager';

import UserSmartWalletArtifact from '../artifacts/UserSmartWallet.json';
// import { UserSmartWallet } from '../typechain/UserSmartWallet'

chai.use(solidity);
const { expect } = chai;

describe('Testing SmartWalletManager', () => {
  // provider not necessary
  // const provider = waffle.provider;
  let signers: Signer[];
  let smartWalletManager: SmartWalletManager;
  // let userSmartWallet: UserSmartWallet;

  // To-do: replace that with `beforeEach`
  before(async () => {
    signers = await ethers.signers();
    smartWalletManager = (await deployContract(
      <Wallet>signers[0],
      SmartWalletManagerArtifact,
    )) as SmartWalletManager;
  });

  describe('Deployment tests', async () => {
    it('Should deploy with a proper contract address', async () => {
      expect(smartWalletManager.address).to.properAddress;
    });
    it('Should set the right owner', async () => {
      expect(await smartWalletManager.owner()).to.eq(await signers[0].getAddress());
    });
  });

  describe('Smart-wallets tests', async () => {
    // TelegramId to test:
    const telegramId = 'Zero-One';
    // User SmartWallet to test:
    let smartWalletAddress = '0x0000000000000000000000000000000000000000'; // Should update during tests
    // Fund amount to test:
    const amountToFund = '1';

    it('Should create a smart-wallet', async () => {
      expect(await smartWalletManager.getWalletAddress(telegramId)).to.eq(
        '0x0000000000000000000000000000000000000000',
      );
      await smartWalletManager.createWallet(telegramId);
      smartWalletAddress = await smartWalletManager.getWalletAddress(telegramId);
      expect(smartWalletAddress).to.not.eq('0x0000000000000000000000000000000000000000');
      // await expect(contract.method()).to.be.reverted; To-do
    });

    it('Should fund a smart-wallet', async () => {
      const tx = await signers[0].sendTransaction({
        to: smartWalletAddress,
        value: ethers.utils.parseEther(amountToFund),
      });
      expect(tx.blockNumber).to.be.greaterThan(0);

      // const userSmartWallet = await ethers.getContractAt('UserSmartWallet', smartWalletAddress);
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      expect(await userSmartWallet.owner()).to.eq(await smartWalletManager.address);
      expect((await userSmartWallet.getBalance()).toString()).to.eq(
        await ethers.utils.parseEther(amountToFund),
      );
    });

    it('Should fund a smart-wallet and intercept the first emitted event', async () => {
      new Promise((resolve, reject) => {
        smartWalletManager.addListener(
          'FundedAccountAddress',
          (telegramIdEmitted: any, userAccountAddressEmitted: any, event: any) => {
            expect(telegramIdEmitted).to.eq(telegramId);
            expect(userAccountAddressEmitted).to.eq(smartWalletAddress);
            event.removeListener();
            resolve();
          },
        );
      });
      const tx = await signers[0].sendTransaction({
        to: smartWalletAddress,
        value: ethers.utils.parseEther(amountToFund),
      });
      expect(tx.blockNumber).to.be.greaterThan(0);
    });

    it('Should fund a smart-wallet and intercept the second emitted event', async () => {
      new Promise((resolve, reject) => {
        smartWalletManager.addListener(
          'FundedAccountAmount',
          (telegramIdEmitted: any, amountEmitted: any, event: any) => {
            expect(telegramIdEmitted).to.eq(telegramId);
            expect(amountEmitted).to.eq(ethers.utils.parseEther(amountToFund));
            event.removeListener();
            resolve();
          },
        );
      });
      const tx = await signers[0].sendTransaction({
        to: smartWalletAddress,
        value: ethers.utils.parseEther(amountToFund),
      });
      expect(tx.blockNumber).to.be.greaterThan(0);
    });
  });
});
