import { BuidlerConfig, usePlugin } from '@nomiclabs/buidler/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/./../../.env' });

usePlugin('buidler-typechain');

const INFURA_API_KEY = parseConf('INFURA_API_KEY');
const RINKEBY_PRIVATE_KEY = parseConf('RINKEBY_PRIVATE_KEY');
const ROPSTEN_PRIVATE_KEY = parseConf('ROPSTEN_PRIVATE_KEY');

const config: BuidlerConfig = {
  defaultNetwork: 'buidlerevm',
  solc: {
    version: '0.5.12',
  },
  paths: {
    sources: './contracts/DAI',
  },
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ROPSTEN_PRIVATE_KEY],
    },
    coverage: {
      url: 'http://127.0.0.1:8555', // Coverage launches its own ganache-cli client
    },
  }
};

function parseConf(key: string): string {
  return process.env[key] ?? '';
}

export default config;
