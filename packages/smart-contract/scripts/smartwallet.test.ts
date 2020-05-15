import { ethers } from '@nomiclabs/buidler';
// import DaiArtifact from '../artifacts/Dai.json';
import UserSmartWalletArtifact from '../artifacts/UserSmartWallet.json';
import { Signer } from 'ethers';
// import { expect } from 'chai';

async function main() {
  let signers: Signer[];
  signers = await ethers.signers();

  console.log(`• Address used for testing: ${await signers[0].getAddress()}`);

  // const DAIAddressRopsten = '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108';
  // const LendingPoolAddressesProviderAddressRopsten = '0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728';
  // const LendingPoolAddressRopsten = '0x9E5C7835E4b13368fd628196C4f1c6cEc89673Fa';
  // const aDAIAddressRopsten = '0xcB1Fe6F440c49E9290c3eb7f158534c2dC374201';

  // const DAIToken = await ethers.getContractAt(DaiArtifact.abi, DAIAddressRopsten);

  // Add your already deployed smart-wallet address here:
  let smartWalletAddress = '';

  const amountToSend = ethers.utils.parseEther('0.01');
  // console.log(`• Amount of DAI for testing: ${ethers.utils.formatEther(amountToSend)} DAI`);

  // If you want to send DAI to the smart-wallet:
  // const tx_DAItransfer = await DAIToken.transfer(smartWalletAddress, amountToSend);
  // await tx_DAItransfer.wait();
  // console.log(`• DAI deposited to the smart-wallet: ${tx_DAItransfer.hash}`);

  const tx = await signers[0].sendTransaction({
    to: smartWalletAddress,
    value: amountToSend,
  });
  await tx.wait();
  console.log(tx.hash);

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

  // If you want to allow the receiving of pBTC, use this:
  const pBTCAddress = '0xEB770B1883Dcce11781649E8c4F1ac5F4B40C978';
  const tx_setpBTC = await userSmartWallet.setERC1820(pBTCAddress, overrides);
  await tx_setpBTC.wait();
  console.log(`• pBTC address set inside smart-wallet: ${tx_setpBTC.hash}`);

  // WIP
  // const tokensSenderInterfaceHash = await userSmartWallet.TOKENS_SENDER_INTERFACE_HASH();
  // await userSmartWallet.senderFor('0xa165841b556C54AD77f8e896a49CeDcdfF7Ca4AC');
  // await this.erc1820.setInterfaceImplementer('0xa165841b556C54AD77f8e896a49CeDcdfF7Ca4AC', tokensSenderInterfaceHash, this.sender.address, { from: holder });
  // const receipt = await this.token.send(recipient, amount, data, { from: holder });
  // await expectEvent.inTransaction(receipt.tx, Simple777Sender, 'DoneStuff', { from: holder, to: recipient, amount: amount, userData: data, operatorData: null });
  // const recipientBalance = await this.token.balanceOf(recipient);
  // recipientBalance.should.be.bignumber.equal(amount);

  // If you want to swap pBTC inside the smart-wallet:
  const amountToSendBTC = ethers.utils.parseEther('0.0002');
  const tx_swappBTC = await userSmartWallet.swappBTCtoBTC(
    '0xEB770B1883Dcce11781649E8c4F1ac5F4B40C978',
    amountToSendBTC,
    'tb1qka8gs4l7d0lhjksuwuhj5fwz6k02x60slua5z8',
    overrides,
  );
  await tx_swappBTC.wait();
  console.log(`• pBTC swapped: ${tx_swappBTC.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
