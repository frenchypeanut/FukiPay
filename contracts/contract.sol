pragma solidity ^0.6.2;

contract SmartWalletManager {
    event createdAccount(string telegramId, address userAccountAddress);
    event FundedAccountAddress(string telegramId, address userAccountAddress);
    event FundedAccountAmount(string telegramId, uint256 amount);
    event SpendFunds(uint256 amount, address userAccountAddress);
    address public owner;

    mapping(string => address) userSmartWallets; // Map of phone numbers to their user-account

    constructor() public {
        owner = msg.sender;
    }

    /** @dev Deploys a smart-contract for generating a smart-wallet.
     * @param telegramId TelegramId of the smart-wallet owner.
     * @return boolean The confirmation of the smart-wallet creation.
     */
    function createWallet(string calldata telegramId) external returns (bool) {
        require(owner == msg.sender, 'Caller must be the owner.');
        require(bytes(telegramId).length > 0, 'The telegramId cannot be empty.');
        userSmartWallets[telegramId] = address(new UserSmartWallet(telegramId));
        emit createdAccount(telegramId, userSmartWallets[telegramId]);
        return true;
    }

    /** @dev Get the address of a specific smart-wallet for a Telegram user.
     * @param telegramId TelegramId of the smart-wallet owner.
     * @return address The address of the smart-wallet.
     */
    function getWalletAddress(string memory telegramId) public view returns (address) {
        require(msg.sender == owner, 'You must be the owner of the contract.');
        require(bytes(telegramId).length > 0, 'The telegramId cannot be empty.');
        return userSmartWallets[telegramId];
    }

    /** @dev Emits an event when a smart-wallet receives funds.
     * @param telegramId TelegramId of the smart-wallet receiving funds.
     * @param amount ETH Amount received by the smart-wallet.
     */
    function fundsAreReceived(string calldata telegramId, uint256 amount) external {
        require(msg.sender == userSmartWallets[telegramId], 'Only a whitelisted smart-wallet should be emitting events.');
        emit FundedAccountAddress(telegramId, msg.sender);
        emit FundedAccountAmount(telegramId, amount);
    }

    // Balance should be retrieved directly by calling the SmartWallet address
    // function getBalance(string memory phoneNumber) public view returns(address){
    // }
}

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