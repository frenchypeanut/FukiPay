import { BuidlerConfig, usePlugin } from '@nomiclabs/buidler/config';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();

usePlugin('@nomiclabs/buidler-waffle');
usePlugin('@nomiclabs/buidler-etherscan');
usePlugin('buidler-typechain');
usePlugin('solidity-coverage');

const INFURA_API_KEY = parseConf('INFURA_API_KEY');
const RINKEBY_PRIVATE_KEY = parseConf('RINKEBY_PRIVATE_KEY');
const ROPSTEN_PRIVATE_KEY = parseConf('ROPSTEN_PRIVATE_KEY');
const ETHERSCAN_API_KEY = parseConf('ETHERSCAN_API_KEY');

const config: BuidlerConfig = {
  defaultNetwork: 'buidlerevm',
  solc: {
    version: '0.6.2',
  },
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    ropsten: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ROPSTEN_PRIVATE_KEY],
    },
    coverage: {
      url: 'http://127.0.0.1:8555', // Coverage launches its own ganache-cli client
    },
  },
  etherscan: {
    url: 'https://api-rinkeby.etherscan.io/api',
    apiKey: ETHERSCAN_API_KEY,
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers',
  },
};

function parseConf(key: string): string {
  return process.env[key] ?? '';
}

export default config;
