import { ethers } from '@nomiclabs/buidler';
import { Signer, Wallet } from 'ethers';
import chai from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import SimpleERC20TokenArtifact from '../artifacts/SimpleERC20Token.json';
import { SimpleERC20Token } from '../typechain/SimpleERC20Token';

chai.use(solidity);
const { expect } = chai;
// const ZERO = '0x0000000000000000000000000000000000000000';

describe('ERC20', function () {
  let signers: Signer[];

  let simpleERC20Token: SimpleERC20Token;
  const INITIAL_SUPPLY = 1000000;
  const NUM_DECIMALS = 18;
  const COIN_NAME = 'BlockHub Token';
  const TICKER = 'BHT';

  beforeEach(async function () {
    signers = await ethers.signers();
    simpleERC20Token = (await deployContract(<Wallet>signers[0], SimpleERC20TokenArtifact, [
      INITIAL_SUPPLY,
    ])) as SimpleERC20Token;
  });

  describe('Deployment', async () => {
    it('deploy with a proper contract address', async () => {
      expect(simpleERC20Token.address).to.properAddress;
    });

    it('create an initial balance for the creator', async () => {
      const balance = await simpleERC20Token.balanceOf(await signers[0].getAddress());
      expect(balance.toNumber()).to.equal(INITIAL_SUPPLY);
    });

    it('verify ERC-20 information', async () => {
      const name = await simpleERC20Token.name();
      expect(name).to.equal(COIN_NAME);
      const decimals = await simpleERC20Token.decimals();
      expect(decimals).to.equal(NUM_DECIMALS);
      const symbol = await simpleERC20Token.symbol();
      expect(symbol).to.equal(TICKER);
    });
  });

  describe('Transfer', async () => {
    it('transfer tokens properly', async () => {
      const amountToSend = 10000;
      await simpleERC20Token.transfer(await signers[1].getAddress(), amountToSend);
      const walletToBalance = await simpleERC20Token.balanceOf(await signers[1].getAddress());
      expect(walletToBalance.toNumber()).to.equal(amountToSend);
    });
  });
});
