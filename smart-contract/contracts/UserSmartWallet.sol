pragma solidity ^0.6.2;

import '@nomiclabs/buidler/console.sol';
import './SmartWalletManager.sol';


contract UserSmartWallet {
    address public owner;
    string public userTelegramId;
    uint256 public userBalance;
    address public userBackupKey;
    bool public activated;

    SmartWalletManager smartWalletManager;

    constructor(string memory telegramId) public {
        owner = msg.sender;
        smartWalletManager = SmartWalletManager(msg.sender);
        require(bytes(telegramId).length > 0, 'The telegramId cannot be empty.');
        userTelegramId = telegramId;
        activated = true;
        userBalance = 0;
    }

    /** @dev Process the deposit of funds when sent to this contract.
     */
    receive() external payable {
        require(msg.data.length == 0); // Check if this works
        userBalance += msg.value;
        smartWalletManager.fundsAreReceived(userTelegramId, msg.value);
    }

    /** @dev Get the current balance of the smart-wallet.
     * @return uint256 The balance of the smart-wallet.
     */
    function getBalance() public view returns (uint256) {
        return userBalance;
    }
}
