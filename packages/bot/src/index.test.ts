import functions from 'firebase-functions-test';

const testEnv = functions();
testEnv.mockConfig({
  bot: {
    token: '',
  },
  network: {
    name: 'ropsten',
  },
  contract: {
    address: '0x68988F07Ec44F2eAc8768041F2B94702d3a852D1',
  },
  owner: {
    pk: '0x2eb81870e5a062a55e63e887efc27ed93c230d56918b9a5b98e731883d788f00',
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
