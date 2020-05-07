import { ethers } from '@nomiclabs/buidler';
import { Signer, Wallet } from 'ethers';
import chai from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import SmartWalletManagerArtifact from '../artifacts/SmartWalletManager.json';
import { SmartWalletManager } from '../typechain/SmartWalletManager';
import UserSmartWalletArtifact from '../artifacts/UserSmartWallet.json';

const ZERO = '0x0000000000000000000000000000000000000000';
const UID = 'u-123';

chai.use(solidity);
const { expect } = chai;

describe('SmartWalletManager', () => {
  let signers: Signer[];
  let smartWalletManager: SmartWalletManager;

  beforeEach(async () => {
    signers = await ethers.signers();
    smartWalletManager = (await deployContract(
      <Wallet>signers[0],
      SmartWalletManagerArtifact,
    )) as SmartWalletManager;

    expect(smartWalletManager.address).to.properAddress;
    expect(await smartWalletManager.owner()).to.eq(await signers[0].getAddress());
  });

  it('create a smart-wallet', async () => {
    const address = await createWallet(smartWalletManager);
    expect(address).to.not.eq(ZERO);
    // await expect(contract.method()).to.be.reverted; To-do
  });

  it('fund a smart-wallet', async () => {
    const address = await createWallet(smartWalletManager);
    const amount = 1;
    const tx = await signers[0].sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount.toString()),
    });
    expect(tx.blockNumber).to.be.greaterThan(0);

    const userSmartWallet = await ethers.getContractAt(UserSmartWalletArtifact.abi, address);
    expect(await userSmartWallet.owner()).to.eq(await smartWalletManager.address);
    expect((await userSmartWallet.getBalance()).toString()).to.eq(
      await ethers.utils.parseEther(amount.toString()),
    );
  });

  it('fund a smart-wallet and intercept the first emitted event', async () => {
    const address = await createWallet(smartWalletManager);
    const amount = 1;

    new Promise((resolve, reject) => {
      smartWalletManager.addListener(
        'FundedAccountAddress',
        (UIDEmitted: any, userAccountAddressEmitted: any, event: any) => {
          expect(UIDEmitted).to.eq(UID);
          expect(userAccountAddressEmitted).to.eq(address);
          event.removeListener();
          resolve();
        },
      );
    });

    const tx = await signers[0].sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount.toString()),
    });

    expect(tx.blockNumber).to.be.greaterThan(0);
  });

  it('fund a smart-wallet and intercept the second emitted event', async () => {
    const address = await createWallet(smartWalletManager);
    const amount = 1;

    new Promise((resolve, reject) => {
      smartWalletManager.addListener(
        'FundedAccountAmount',
        (UIDEmitted: any, amountEmitted: any, event: any) => {
          expect(UIDEmitted).to.eq(UID);
          expect(amountEmitted).to.eq(ethers.utils.parseEther(amount.toString()));
          event.removeListener();
          resolve();
        },
      );
    });

    const tx = await signers[0].sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount.toString()),
    });

    expect(tx.blockNumber).to.be.greaterThan(0);
  });
});

const createWallet = async (smartWalletManager: SmartWalletManager) => {
  expect(await smartWalletManager.getWalletAddress(UID)).to.eq(ZERO);
  await smartWalletManager.createWallet(UID);
  const address = await smartWalletManager.getWalletAddress(UID);

  return address;
};
