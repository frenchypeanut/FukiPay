pragma solidity ^0.6.2;

import '@nomiclabs/buidler/console.sol';
import './UserSmartWallet.sol';

contract SmartWalletManager {
    event CreatedAccount(string _uid, address _userAccountAddress);
    event FundedAccount(string _uid, address _fromAddress, uint256 _amount);
    // event SpendFunds(uint256 _amount, address _toAddress);

    address public owner;

    mapping(string => address) userSmartWallets; // Map of uids to their user-account

    modifier onlyOwner() {
        require(msg.sender == owner, 'Caller must be the owner.');
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    /**
     * @dev Deploys a smart-contract for generating a smart-wallet.
     * @param _uid unique identifier of the smart-wallet owner.
     * @return boolean The confirmation of the smart-wallet creation.
     */
    function createWallet(string calldata _uid) external onlyOwner returns (bool) {
        require(bytes(_uid).length > 0, 'The uid cannot be empty.');
        require(userSmartWallets[_uid] == address(0), 'The uid already has a wallet.');
        userSmartWallets[_uid] = address(new UserSmartWallet(_uid)); // DAI Ropsten: address(0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108)
        emit CreatedAccount(_uid, userSmartWallets[_uid]);
        return true;
    }

    /**
     * @dev Get the address of a specific smart-wallet for a Telegram user.
     * @param _uid unique identifier of the smart-wallet owner.
     * @return address The address of the smart-wallet.
     */
    function getWalletAddress(string memory _uid) public view onlyOwner returns (address) {
        require(bytes(_uid).length > 0, 'The uid cannot be empty.');
        return userSmartWallets[_uid];
    }

    /**
     * @dev Emits an event when a smart-wallet receives funds.
     * @param _uid unique identifier of the smart-wallet receiving funds.
     * @param _amount ETH Amount received by the smart-wallet.
     */
    function fundsAreReceived(string calldata _uid, uint256 _amount, address _sender) external {
        require(
            msg.sender == userSmartWallets[_uid],
            'Only a whitelisted smart-wallet should be emitting events.'
        );
        emit FundedAccount(_uid, _sender, _amount);
    }

    // Balance should be retrieved directly by calling the SmartWallet address
    // function getBalance(string memory _uid) public view returns(address){
    // }
}
