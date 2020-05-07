import { ethers } from '@nomiclabs/buidler';
import { Signer, Wallet } from 'ethers';
import chai from 'chai';
import { deployContract, solidity, MockProvider } from 'ethereum-waffle';
import SmartWalletManagerArtifact from '../artifacts/SmartWalletManager.json';
import { SmartWalletManager } from '../typechain/SmartWalletManager';

import UserSmartWalletArtifact from '../artifacts/UserSmartWallet.json';
import { TransactionResponse } from 'ethers/providers';
// import { UserSmartWallet } from '../typechain/UserSmartWallet'

chai.use(solidity);
const { expect } = chai;

describe('Testing SmartWalletManager', () => {
  // const [wallet] = new MockProvider().getWallets();
  let signers: Signer[];
  let smartWalletManager: SmartWalletManager;
  // let userSmartWallet: UserSmartWallet;

  // May need to replace that with `beforeEach` later on:
  before(async () => {
    signers = await ethers.signers();
    smartWalletManager = (await deployContract(
      <Wallet>signers[0], // `wallet` : If you need to test the contract with a mocked provider
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

  describe('Smart-wallet tests', async () => {
    // TelegramId to test:
    const telegramId = '123456789';
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
    });

    it('Should fund a smart-wallet', async () => {
      const tx: TransactionResponse = await signers[0].sendTransaction({
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
      await expect(
        signers[0].sendTransaction({
          to: smartWalletAddress,
          value: ethers.utils.parseEther(amountToFund),
        }),
      )
        .to.emit(smartWalletManager, 'FundedAccountAddress')
        .withArgs(telegramId, smartWalletAddress);
    });

    it('Should fund a smart-wallet and intercept the second emitted event', async () => {
      await expect(
        signers[0].sendTransaction({
          to: smartWalletAddress,
          value: ethers.utils.parseEther(amountToFund),
        }),
      )
        .to.emit(smartWalletManager, 'FundedAccountAmount')
        .withArgs(telegramId, ethers.utils.parseEther(amountToFund));
    });

    it('Should not create a smart-wallet to the same user twice', async () => {
      expect(await smartWalletManager.getWalletAddress(telegramId)).to.eq(smartWalletAddress);
      await expect(smartWalletManager.createWallet(telegramId)).to.be.revertedWith(
        'The telegramId already has a wallet.',
      );
    });

    it('Should not create a smart-wallet if the caller is not the owner', async () => {
      expect(await smartWalletManager.getWalletAddress(telegramId)).to.eq(smartWalletAddress);
      let newTelegramId = '987654321';
      const nonAdminSmartWalletManager = smartWalletManager.connect(<Wallet>signers[1]);
      await expect(nonAdminSmartWalletManager.createWallet(newTelegramId)).to.be.revertedWith(
        'Caller must be the owner.',
      );
    });
  });
});
