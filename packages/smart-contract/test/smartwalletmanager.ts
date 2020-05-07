import { ethers } from '@nomiclabs/buidler';
import { Signer, Wallet } from 'ethers';
import chai from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import SmartWalletManagerArtifact from '../artifacts/SmartWalletManager.json';
import { SmartWalletManager } from '../typechain/SmartWalletManager';
import UserSmartWalletArtifact from '../artifacts/UserSmartWallet.json';
import { TransactionResponse } from 'ethers/providers';
// import { UserSmartWallet } from '../typechain/UserSmartWallet'

chai.use(solidity);
const { expect } = chai;
const ZERO = '0x0000000000000000000000000000000000000000';

describe('SmartWalletManager', () => {
  let signers: Signer[];
  let smartWalletManager: SmartWalletManager;
  // let userSmartWallet: UserSmartWallet;
  before(async () => {
    signers = await ethers.signers();
    smartWalletManager = (await deployContract(
      <Wallet>signers[0], // `wallet` : If you need to test the contract with a mocked provider
      SmartWalletManagerArtifact,
    )) as SmartWalletManager;
  });

  describe('Deployment', async () => {
    it('deploy with a proper contract address', async () => {
      expect(smartWalletManager.address).to.properAddress;
    });
    it('set the right owner', async () => {
      expect(await smartWalletManager.owner()).to.eq(await signers[0].getAddress());
    });
  });

  describe('Smart-wallet', async () => {
    const UID = '123456789';
    let smartWalletAddress = ZERO;
    const amountToFund = '1';

    it('create a smart-wallet', async () => {
      expect(await smartWalletManager.getWalletAddress(UID)).to.eq(ZERO);
      await smartWalletManager.createWallet(UID);
      smartWalletAddress = await smartWalletManager.getWalletAddress(UID);
      expect(smartWalletAddress).to.not.eq(ZERO);
    });

    it('fund a smart-wallet', async () => {
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

    it('fund a smart-wallet and intercept the first emitted event', async () => {
      await expect(
        signers[1].sendTransaction({
          to: smartWalletAddress,
          value: ethers.utils.parseEther(amountToFund),
        }),
      )
        .to.emit(smartWalletManager, 'FundedAccountAddress')
        .withArgs(UID, smartWalletAddress);
    });

    it('fund a smart-wallet and intercept the second emitted event', async () => {
      await expect(
        signers[2].sendTransaction({
          to: smartWalletAddress,
          value: ethers.utils.parseEther(amountToFund),
        }),
      )
        .to.emit(smartWalletManager, 'FundedAccountAmount')
        .withArgs(UID, ethers.utils.parseEther(amountToFund));
    });

    it('can not create a smart-wallet to the same user twice', async () => {
      expect(await smartWalletManager.getWalletAddress(UID)).to.eq(smartWalletAddress);
      await expect(smartWalletManager.createWallet(UID)).to.be.revertedWith(
        'The uid already has a wallet.',
      );
    });

    it('can not create a smart-wallet if the caller is not the owner', async () => {
      expect(await smartWalletManager.getWalletAddress(UID)).to.eq(smartWalletAddress);
      let newUID = '987654321';
      const nonAdminSmartWalletManager = smartWalletManager.connect(<Wallet>signers[1]);
      await expect(nonAdminSmartWalletManager.createWallet(newUID)).to.be.revertedWith(
        'Caller must be the owner.',
      );
    });
  });
});
