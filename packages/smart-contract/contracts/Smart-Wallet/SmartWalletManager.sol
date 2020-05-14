pragma solidity ^0.6.2;

import '@nomiclabs/buidler/console.sol';
import './UserSmartWallet.sol';


contract SmartWalletManager {
    event CreatedAccount(string _uid, address _userAccountAddress);
    event FundedAccountAddress(string _uid, address _userAccountAddress);
    event FundedAccountAmount(string _uid, uint256 _amount);
    event SpendFunds(uint256 _amount, address _userAccountAddress);

    address public owner;
    address public DAI_contract;

    mapping(string => address) userSmartWallets; // Map of uids to their user-account

    constructor() public {
        owner = msg.sender;
    }

    /**
     * @dev Deploys a smart-contract for generating a smart-wallet.
     * @param _uid unique identifier of the smart-wallet owner.
     * @return boolean The confirmation of the smart-wallet creation.
     */
    function createWallet(string calldata _uid) external returns (bool) {
        require(owner == msg.sender, 'Caller must be the owner.');
        require(bytes(_uid).length > 0, 'The uid cannot be empty.');
        require(userSmartWallets[_uid] == address(0), 'The uid already has a wallet.');
        userSmartWallets[_uid] = address(new UserSmartWallet(_uid, DAI_contract));
        emit CreatedAccount(_uid, userSmartWallets[_uid]);
        return true;
    }

    /**
     * @dev Get the address of a specific smart-wallet for a Telegram user.
     * @param _uid unique identifier of the smart-wallet owner.
     * @return address The address of the smart-wallet.
     */
    function getWalletAddress(string memory _uid) public view returns (address) {
        require(msg.sender == owner, 'You must be the owner of the contract.');
        require(bytes(_uid).length > 0, 'The uid cannot be empty.');
        return userSmartWallets[_uid];
    }

    /**
     * @dev Emits an event when a smart-wallet receives funds.
     * @param _uid unique identifier of the smart-wallet receiving funds.
     * @param _amount ETH Amount received by the smart-wallet.
     */
    function fundsAreReceived(string calldata _uid, uint256 _amount) external {
        require(
            msg.sender == userSmartWallets[_uid],
            'Only a whitelisted smart-wallet should be emitting events.'
        );
        emit FundedAccountAddress(_uid, msg.sender);
        emit FundedAccountAmount(_uid, _amount);
    }

    /** @dev Update DAI contract address if necessary
     */
    function setDAIAddress(address _DAI_contract) public {
        require(owner == msg.sender, 'Only the owner can update the contract address');
        DAI_contract = _DAI_contract; // DAI in Kovan: 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
    }

    // Balance should be retrieved directly by calling the SmartWallet address
    // function getBalance(string memory _uid) public view returns(address){
    // }
}
