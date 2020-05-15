import { BuidlerConfig, usePlugin } from '@nomiclabs/buidler/config';
import { INFURA_API_KEY, RINKEBY_PRIVATE_KEY, ROPSTEN_PRIVATE_KEY } from './config';

usePlugin('buidler-typechain');

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
  },
};

export default config;
