import * as functions from 'firebase-functions';

export const BOT_TOKEN = functions.config().bot.token;
export const INFURA_APIKEY = functions.config().infura?.apikey;
export const NETWORK_BTC = functions.config().network.btc;
export const NETWORK_ETH = functions.config().network.eth;
export const CONTRACT_ADDRESS = functions.config().contract.address;
export const OWNER_PK = functions.config().owner.pk;
