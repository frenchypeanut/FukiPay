import * as functions from 'firebase-functions';

export const BOT_TOKEN = functions.config().bot.token;
export const NETWORK = functions.config().network.name;
export const CONTRACT_ADDRESS = functions.config().contract.address;
export const OWNER_PK = functions.config().owner.pk;
