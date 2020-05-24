import * as functions from 'firebase-functions';

export const BOT_TOKEN = functions.config().bot.token;
export const INFURA_APIKEY = functions.config().infura?.apikey;
export const NETWORK_BTC = functions.config().network.btc;
export const NETWORK_ETH = functions.config().network.eth;
export const CONTRACT_ADDRESS_MANAGER = functions.config().contract_address.manager;
export const CONTRACT_ADDRESS_DAI = functions.config().contract_address.dai;
export const CONTRACT_ADDRESS_ADAI = '0xcB1Fe6F440c49E9290c3eb7f158534c2dC374201';
export const OWNER_PK = functions.config().owner.pk;
export const SERVICE_NAME = functions.config().service.name;
