import { ethers } from '@nomiclabs/buidler';
import { Signer, Wallet, constants } from 'ethers';
import chai from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import SmartWalletManagerArtifact from '../artifacts/SmartWalletManager.json';
import { SmartWalletManager } from '../typechain/SmartWalletManager';
import UserSmartWalletArtifact from '../artifacts/UserSmartWallet.json';
import { TransactionResponse } from 'ethers/providers';
// import { UserSmartWallet } from '../typechain/UserSmartWallet'
import SimpleERC20TokenArtifact from '../artifacts/SimpleERC20Token.json';
import { SimpleERC20Token } from '../typechain/SimpleERC20Token';
import DaiArtifact from '../artifacts/Dai.json';
import { Dai } from '../typechain/Dai';

chai.use(solidity);
const { expect } = chai;
const ZERO = constants.AddressZero;
let smartWalletAddress = ZERO;

describe('SmartWalletManager', () => {
  let signers: Signer[];
  let smartWalletManager: SmartWalletManager;
  let simpleERC20Token: SimpleERC20Token;
  const INITIAL_SUPPLY = 1000000;
  let dai: Dai;

  before(async () => {
    signers = await ethers.signers();
    smartWalletManager = (await deployContract(
      <Wallet>signers[0], // `wallet` : If you need to test the contract with a mocked provider
      SmartWalletManagerArtifact,
    )) as SmartWalletManager;

    simpleERC20Token = (await deployContract(<Wallet>signers[0], SimpleERC20TokenArtifact, [
      INITIAL_SUPPLY,
    ])) as SimpleERC20Token;

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
      expect(simpleERC20Token.address).to.properAddress;
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
    const amountToFund = '1';

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
      expect(await userSmartWallet.hasOwnerAccess(await signers[0].getAddress())).to.be.true;
      expect((await userSmartWallet.getBalance()).toString()).to.eq(
        await ethers.utils.parseEther(amountToFund),
      );
    });

    it('fund a smart-wallet with ETH and intercept the emitted event', async () => {
      await expect(
        signers[1].sendTransaction({
          to: smartWalletAddress,
          value: ethers.utils.parseEther(amountToFund),
        }),
      )
        .to.emit(smartWalletManager, 'FundedAccount')
        .withArgs(UID, await signers[1].getAddress(), ethers.utils.parseEther(amountToFund));
    });

    it('smart-wallet can send ETH', async () => {
      const amountToSend = ethers.utils.parseEther('1');
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      const previousBalance = (await userSmartWallet.getBalance()) / 1e18;
      await userSmartWallet.transferETH(await signers[1].getAddress(), amountToSend);
      expect(previousBalance).to.greaterThan((await userSmartWallet.getBalance()) / 1e18);
    });

    it('can not send more ETH than it currently have', async () => {
      const amountToSend = ethers.utils.parseEther('100');
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      await expect(
        userSmartWallet.transferETH(await signers[1].getAddress(), amountToSend),
      ).to.be.revertedWith('Insufficient balance inside the smart-wallet');
    });

    it('can not send ETH if the caller is not the owner', async () => {
      const amountToSend = ethers.utils.parseEther('1');
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      const nonAdminUserSmartWallet = userSmartWallet.connect(<Wallet>signers[1]);
      await expect(
        nonAdminUserSmartWallet.transferETH(await signers[1].getAddress(), amountToSend),
      ).to.be.revertedWith('Caller must be the owner.');
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
      await simpleERC20Token.transfer(smartWalletAddress, amountToSend);
      const walletToBalance = await simpleERC20Token.balanceOf(smartWalletAddress);
      expect(walletToBalance.toNumber()).to.equal(amountToSend);
    });

    it('smart-wallet can send ERC-20 token', async () => {
      const amountToSend = 10000;
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      await userSmartWallet.transferERC20token(
        simpleERC20Token.address,
        await signers[1].getAddress(),
        amountToSend,
      );
      expect((await simpleERC20Token.balanceOf(await signers[1].getAddress())).toNumber()).to.equal(
        amountToSend,
      );
      expect((await simpleERC20Token.balanceOf(smartWalletAddress)).toNumber()).to.equal(0);
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
      await userSmartWallet.transferDAItoken(
        dai.address,
        await signers[1].getAddress(),
        amountToSend,
      );
      expect((await dai.balanceOf(await signers[1].getAddress())).toNumber()).to.equal(
        amountToSend,
      );
      expect((await dai.balanceOf(smartWalletAddress)).toNumber()).to.equal(0);
    });
  });
  describe('Owners', async () => {
    it('add a new owner', async () => {
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      expect(await userSmartWallet.hasOwnerAccess(await signers[1].getAddress())).to.be.false;
      await userSmartWallet.addOwner(await signers[1].getAddress());
      expect(await userSmartWallet.hasOwnerAccess(await signers[1].getAddress())).to.be.true;
    });

    it('can not add a new owner if registerer is not an owner', async () => {
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      expect(await userSmartWallet.hasOwnerAccess(await signers[2].getAddress())).to.be.false;
      const nonAdminUserSmartWallet = userSmartWallet.connect(<Wallet>signers[2]);
      await expect(
        nonAdminUserSmartWallet.addOwner(await signers[2].getAddress()),
      ).to.be.revertedWith('Caller must be the owner.');
    });

    it('can not remove an owner if owner of the smartwallet manager is calling', async () => {
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      await expect(userSmartWallet.removeOwner(await signers[1].getAddress())).to.be.revertedWith(
        'The SmartWalletManager should not remove owners.',
      );
    });

    it('smart-wallet user can remove telegram ownership properly', async () => {
      const userSmartWallet = await ethers.getContractAt(
        UserSmartWalletArtifact.abi,
        smartWalletAddress,
      );
      const nonAdminUserSmartWallet = userSmartWallet.connect(<Wallet>signers[1]);
      expect(await nonAdminUserSmartWallet.hasOwnerAccess(await signers[0].getAddress())).to.be
        .true;
      await nonAdminUserSmartWallet.removeOwner(await signers[0].getAddress());
      expect(await nonAdminUserSmartWallet.hasOwnerAccess(await signers[0].getAddress())).to.be
        .false;
    });
  });
});
