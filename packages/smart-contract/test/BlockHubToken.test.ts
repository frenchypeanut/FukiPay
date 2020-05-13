import { ethers } from '@nomiclabs/buidler';
import { Signer, Wallet } from 'ethers';
import chai from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import BlockHubTokenArtifact from '../artifacts/BlockHubToken.json';
import { BlockHubToken } from '../typechain/BlockHubToken';

chai.use(solidity);
const { expect } = chai;
// const ZERO = '0x0000000000000000000000000000000000000000';

describe('ERC20', function () {
    let signers: Signer[];

    let blockHubToken: BlockHubToken;
    const INITIAL_SUPPLY = 1000000;
    const NUM_DECIMALS = 18;
    const COIN_NAME = "BlockHub Token";
    const TICKER = "BHT";

    beforeEach(async function () {
        signers = await ethers.signers();
        blockHubToken = (await deployContract(
            <Wallet>signers[0],
            BlockHubTokenArtifact,
            [INITIAL_SUPPLY]
        )) as BlockHubToken;
    });

    describe('Deployment', async () => {
        it('deploy with a proper contract address', async () => {
            expect(blockHubToken.address).to.properAddress;
        });

        it('create an initial balance for the creator', async () => {
            const balance = await blockHubToken.balanceOf(await signers[0].getAddress())
            expect(balance.toNumber()).to.equal(INITIAL_SUPPLY);
        });

        it('verify ERC-20 information', async () => {
            const name = await blockHubToken.name();
            expect(name).to.equal(COIN_NAME);
            const decimals = await blockHubToken.decimals();
            expect(decimals).to.equal(NUM_DECIMALS);
            const symbol = await blockHubToken.symbol();
            expect(symbol).to.equal(TICKER);
        });
    });

    describe('Transfer', async () => {
        it('transfer tokens properly', async () => {
            const amountToSend = 10000;
            await blockHubToken.transfer(await signers[1].getAddress(), amountToSend);
            const walletToBalance = await blockHubToken.balanceOf(await signers[1].getAddress());
            expect(walletToBalance.toNumber()).to.equal(amountToSend);
        });
    })
});
