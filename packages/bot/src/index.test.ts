import functions from 'firebase-functions-test';
import { constants } from 'ethers';

const testEnv = functions();
testEnv.mockConfig({
  network: {
    btc: '',
    eth: 'ropsten',
  },
  owner: {
    pk: '0xed930afbfc45260c53590fb5b48bb1892f7e35bcde05d9c743c778c99ecf0380',
  },
  infura: {
    apikey: 'test',
  },
  contract_address: {
    manager: constants.AddressZero,
    dai: constants.AddressZero,
  },
  bot: {
    token: '',
  },
  service: {
    name: '',
  },
});

const { tgWebhook } = require('./index');

describe('load without crashing', () => {
  test('no crash', () => {
    const req = {
      body: {},
    };
    const res = {};
    tgWebhook(req as any, res as any);
  });
});
