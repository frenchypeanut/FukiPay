const { pBTC } = require('ptokens-pbtc');

async function main() {
  const pbtc = new pBTC({
    ethPrivateKey: '',
    ethProvider: '',
    btcNetwork: 'testnet', //'testnet' or 'bitcoin', default 'testnet'
  });

  // const depositAddress = await pbtc.getDepositAddress(''); // Derived from the private key above
  const depositAddress = await pbtc.getDepositAddress('');

  console.log(depositAddress.toString());

  //fund the BTC address just generated (not ptokens.js stuff)

  depositAddress
    .waitForDeposit()
    .once('onBtcTxBroadcasted', (tx) => console.log(tx))
    .once('onBtcTxConfirmed', (tx) => console.log(tx))
    .once('onNodeReceivedTx', (report) => console.log(report))
    .once('onNodeBroadcastedTx', (report) => console.log(report))
    .once('onEthTxConfirmed', (tx) => console.log(tx))
    .then((res) => console.log(res));
}

main();
