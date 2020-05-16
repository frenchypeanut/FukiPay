import { utils } from 'ethers';

// CreatedAccount(string _uid, address _userAccountAddress)
const TOPIC_CREATED_ACCOUNT = '0x61d79c39ec9df561d2bc7269fb2dbf24d08ced4ab344c4c03b6aaf70d4f09df2';

const events = (() => {
  return {
    isCreatedAccount(topic: string): boolean {
      return topic === TOPIC_CREATED_ACCOUNT;
    },

    decodeCreatedAccount(data: string): any {
      return utils.defaultAbiCoder.decode(['string', 'address'], data);
    },
  };
})();

export default events;
