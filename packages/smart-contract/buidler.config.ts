import { BuidlerConfig, usePlugin } from '@nomiclabs/buidler/config';
import {
  ETHERSCAN_API_KEY,
  INFURA_API_KEY,
  RINKEBY_PRIVATE_KEY,
  ROPSTEN_PRIVATE_KEY,
} from './config';

usePlugin('@nomiclabs/buidler-waffle');
usePlugin('@nomiclabs/buidler-etherscan');
usePlugin('buidler-typechain');
usePlugin('solidity-coverage');

const config: BuidlerConfig = {
  defaultNetwork: 'buidlerevm',
  solc: {
    version: '0.6.2',
  },
  paths: {
    sources: './contracts/Smart-Wallet',
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

export default config;
