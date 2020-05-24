import { utils } from 'ethers';

// CreatedAccount(string _uid, address _userAccountAddress)
export const TOPIC_CREATED_ACCOUNT =
  '0x61d79c39ec9df561d2bc7269fb2dbf24d08ced4ab344c4c03b6aaf70d4f09df2';
// FundedAccount(string _uid, address _fromAddress, uint256 _amount)
export const TOPIC_FUNDED_ACCOUNT =
  '0x86ffa7f9e82e72bea86859f47602d2f7e97c4b64229bf3169ace19b5b3d302b0';
// SpendFunds(uint256 _amount, address _toAddress)
export const TOPIC_SPEND_FUNDS =
  '0xd55674c9083b6191e6cd0e2fc55f265bd56e07d8deff5212e2cbe3ef4104be0e';

const events = (() => {
  return {
    decodeCreatedAccount(data: string): any {
      return utils.defaultAbiCoder.decode(['string', 'address'], data);
    },

    decodeFundedAccount(data: string): any {
      return utils.defaultAbiCoder.decode(['string', 'address', 'uint256'], data);
    },

    decodeSpendFunds(data: string): any {
      return utils.defaultAbiCoder.decode(['uint256', 'address'], data);
    },
  };
})();

export default events;
