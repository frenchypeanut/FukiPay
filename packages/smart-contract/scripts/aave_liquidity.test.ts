import { ethers } from '@nomiclabs/buidler';
import DaiArtifact from '../artifacts/Dai.json';
import UserSmartWalletArtifact from '../artifacts/UserSmartWallet.json';
import { Signer } from 'ethers';
// import { expect } from 'chai';

async function main() {
  let signers: Signer[];
  signers = await ethers.signers();

  console.log(`• Address used for deployment: ${await signers[0].getAddress()}`);

  const SmartWalletManager = await ethers.getContract('SmartWalletManager');

  let smartWalletManager = await SmartWalletManager.deploy();
  console.log(`• Smart-wallet Manager address: ${smartWalletManager.address}`);
  console.log(
    `• Smart-wallet Manager confirmation transaction hash: ${smartWalletManager.deployTransaction.hash}`,
  );
  await smartWalletManager.deployed();

  const DAIAddressRopsten = '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108';

  const DAIToken = await ethers.getContractAt(DaiArtifact.abi, DAIAddressRopsten);

  const randomUID = 'Zero-One';

  const tx_createWallet = await smartWalletManager.createWallet(randomUID);
  await tx_createWallet.wait();

  let smartWalletAddress = await smartWalletManager.getWalletAddress(randomUID);
  console.log(`• User smart-wallet created: ${smartWalletAddress}`);

  const amountToSend = ethers.utils.parseEther('0.1');
  console.log(`• Amount to send for testing: ${ethers.utils.formatEther(amountToSend)} DAI`);

  const tx_DAItransfer = await DAIToken.transfer(smartWalletAddress, amountToSend);
  await tx_DAItransfer.wait();
  console.log(`• DAI deposited to the smart-wallet: ${tx_DAItransfer.hash}`);

  const userSmartWallet = await ethers.getContractAt(
    UserSmartWalletArtifact.abi,
    smartWalletAddress,
  );

  let overrides = {
    // The maximum units of gas for the transaction to use
    gasLimit: 1000000,
    // The price (in wei) per unit of gas
    gasPrice: ethers.utils.parseUnits('9.0', 'gwei'),
  };
  const tx_depositAave = await userSmartWallet.depositFundsAave(
    DAIAddressRopsten,
    amountToSend,
    overrides,
  );
  await tx_depositAave.wait();
  console.log(`• DAI deposited to Aave liquidity pool for aDAI: ${tx_depositAave.hash}`);

  const aDAIAddressRopsten = '0xcB1Fe6F440c49E9290c3eb7f158534c2dC374201';

  const tx_redeemAave = await userSmartWallet.redeemAaveToken(
    aDAIAddressRopsten,
    amountToSend,
    overrides,
  );
  await tx_redeemAave.wait();
  console.log(`• aDAI redeemed from the Aave liquidity pool: ${tx_redeemAave.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
