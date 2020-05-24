import { InfuraProvider } from 'ethers/providers';
import { NETWORK_ETH, INFURA_APIKEY } from '../config';

export default new InfuraProvider(NETWORK_ETH, INFURA_APIKEY);
