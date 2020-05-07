pragma solidity ^0.6.2;

import '@nomiclabs/buidler/console.sol';
import './SmartWalletManager.sol';


contract UserSmartWallet {
    address public owner;
    string public uid;
    uint256 public userBalance;
    address public userBackupKey;
    bool public activated;

    SmartWalletManager smartWalletManager;

    constructor(string memory _uid) public {
        owner = msg.sender;
        smartWalletManager = SmartWalletManager(msg.sender);
        require(bytes(_uid).length > 0, 'The uid cannot be empty.');
        uid = _uid;
        activated = true;
        userBalance = 0;
    }

    /** @dev Process the deposit of funds when sent to this contract.
     */
    receive() external payable {
        require(msg.data.length == 0); // Check if this works
        userBalance += msg.value;
        smartWalletManager.fundsAreReceived(uid, msg.value);
    }

    /** @dev Get the current balance of the smart-wallet.
     * @return uint256 The balance of the smart-wallet.
     */
    function getBalance() public view returns (uint256) {
        return userBalance;
    }
}
