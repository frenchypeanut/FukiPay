import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/./../../.env' });

export const INFURA_API_KEY = parseConf('INFURA_API_KEY');
export const RINKEBY_PRIVATE_KEY = parseConf('RINKEBY_PRIVATE_KEY');
export const ROPSTEN_PRIVATE_KEY = parseConf('ROPSTEN_PRIVATE_KEY');
export const ETHERSCAN_API_KEY = parseConf('ETHERSCAN_API_KEY');

function parseConf(key: string): string {
  return process.env[key] ?? '';
}
