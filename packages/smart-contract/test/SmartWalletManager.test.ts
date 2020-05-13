import { ethers } from '@nomiclabs/buidler';
import { Signer, Wallet } from 'ethers';
import chai from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import SmartWalletManagerArtifact from '../artifacts/SmartWalletManager.json';
import { SmartWalletManager } from '../typechain/SmartWalletManager';
import UserSmartWalletArtifact from '../artifacts/UserSmartWallet.json';
import { TransactionResponse } from 'ethers/providers';
// import { UserSmartWallet } from '../typechain/UserSmartWallet'
import BlockHubTokenArtifact from '../artifacts/BlockHubToken.json';
import { BlockHubToken } from '../typechain/BlockHubToken';
import DaiArtifact from '../artifacts/Dai.json';
import { Dai } from '../typechain/Dai';

chai.use(solidity);
const { expect } = chai;
const ZERO = '0x0000000000000000000000000000000000000000';

describe('SmartWalletManager', () => {
  let signers: Signer[];
  let smartWalletManager: SmartWalletManager;
  let blockHubToken: BlockHubToken;
  const INITIAL_SUPPLY = 1000000;
  let dai: Dai;

  before(async () => {
    signers = await ethers.signers();
    smartWalletManager = (await deployContract(
      <Wallet>signers[0], // `wallet` : If you need to test the contract with a mocked provider
      SmartWalletManagerArtifact,
    )) as SmartWalletManager;

    blockHubToken = (await deployContract(<Wallet>signers[0], BlockHubTokenArtifact, [
      INITIAL_SUPPLY,
    ])) as BlockHubToken;

    dai = (await deployContract(
      <Wallet>signers[0],
      DaiArtifact,
      [1], // Default CHAIN_ID
    )) as Dai;
  });

  describe('Deployment', async () => {
    it('deploy smart-wallet manager with a proper contract address', async () => {
      expect(smartWalletManager.address).to.properAddress;
    });

    it('set the right owner for the smart-wallet manager', async () => {
      expect(await smartWalletManager.owner()).to.eq(await signers[0].getAddress());
    });

    it('deploy ERC-20 token with a proper contract address', async () => {
      expect(blockHubToken.address).to.properAddress;
    });

    it('deploy DAI token with a proper contract address', async () => {
      expect(dai.address).to.properAddress;
    });

    it('mint DAI token to the owner wallet', async () => {
      await dai.mint(await signers[0].getAddress(), 1000);
      expect(await dai.balanceOf(await signers[0].getAddress())).to.eq(1000);
    });
  });

  describe('Smart-wallet', async () => {
    const UID = '123456789';
    let smartWalletAddress = ZERO;
    const amountToFund = '1';

    it('set the DAI contract address inside the smart-wallet manager', async () => {
      expect(await smartWalletManager.DAI_contract()).to.eq(ZERO);
      await smartWalletManager.setDAIAddress(dai.address);
      expect(await smartWalletManager.DAI_contract()).to.eq(dai.address);
    });

    it('create a smart-wallet', async () => {
      expect(await smartWalletManager.getWalletAddress(UID)).to.eq(ZERO);
      await smartWalletManager.createWallet(UID);
      smartWalletAddress = await smartWalletManager.getWalletAddress(UID);
      expect(smartWalletAddress).to.not.eq(ZERO);
    });

    it('fund a smart-wallet with ETH', async () => {
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

    it('fund a smart-wallet with ETH and intercept the first emitted event', async () => {
      await expect(
        signers[1].sendTransaction({
          to: smartWalletAddress,
          value: ethers.utils.parseEther(amountToFund),
        }),
      )
        .to.emit(smartWalletManager, 'FundedAccountAddress')
        .withArgs(UID, smartWalletAddress);
    });

    it('fund a smart-wallet with ETH and intercept the second emitted event', async () => {
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

    it('fund a smart-wallet with ERC-20 token', async () => {
      const amountToSend = 10000;
      await blockHubToken.transfer(smartWalletAddress, amountToSend);
      const walletToBalance = await blockHubToken.balanceOf(smartWalletAddress);
      expect(walletToBalance.toNumber()).to.equal(amountToSend);
    });

    it('smart-wallet can send ERC-20 token', async () => {
      const amountToSend = 10000;
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      await userSmartWallet.transferERC20token(
        blockHubToken.address,
        await signers[1].getAddress(),
        amountToSend,
      );
      expect((await blockHubToken.balanceOf(await signers[1].getAddress())).toNumber()).to.equal(
        amountToSend,
      );
      expect((await blockHubToken.balanceOf(smartWalletAddress)).toNumber()).to.equal(0);
    });

    it(`can not send ERC-20 token the smart-wallet doesn't have or doesn't exist`, async () => {
      const amountToSend = 10000;
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      await expect(
        userSmartWallet.transferERC20token(ZERO, await signers[1].getAddress(), amountToSend),
      ).to.be.revertedWith('Cannot use zero address.');
    });

    it('fund a smart-wallet with DAI token', async () => {
      const amountToSend = 1000;
      await dai.transfer(smartWalletAddress, amountToSend);
      const walletToBalance = await dai.balanceOf(smartWalletAddress);
      expect(walletToBalance.toNumber()).to.equal(amountToSend);
    });

    it('smart-wallet can send DAI token', async () => {
      const amountToSend = 1000;
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      await userSmartWallet.transferDAItoken(await signers[1].getAddress(), amountToSend);
      expect((await dai.balanceOf(await signers[1].getAddress())).toNumber()).to.equal(
        amountToSend,
      );
      expect((await dai.balanceOf(smartWalletAddress)).toNumber()).to.equal(0);
    });
  });
});
