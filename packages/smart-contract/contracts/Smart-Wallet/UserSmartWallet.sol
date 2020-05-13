pragma solidity ^0.6.2;

import '@nomiclabs/buidler/console.sol';
import './SmartWalletManager.sol';
import "@openzeppelin/contracts/math/SafeMath.sol";


// Adding only the ERC-20 function we need for DAI
interface DaiToken {
    function balanceOf(address guy) external view returns (uint256);

    function transfer(address dst, uint256 wad) external returns (bool);
}


// Adding only the ERC-20 function we need for a token
interface Token {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
}


contract UserSmartWallet {
    using SafeMath for uint256;
    address public owner;
    string public uid;
    uint256 public userBalance;
    address public userBackupKey;
    bool public activated;

    SmartWalletManager smartWalletManager;

    DaiToken daitoken;

    constructor(string memory _uid, address DAI_contract) public {
        owner = msg.sender;
        smartWalletManager = SmartWalletManager(msg.sender);
        require(bytes(_uid).length > 0, 'The uid cannot be empty.');
        uid = _uid;
        activated = true;
        userBalance = 0;
        setDAIContract(DAI_contract);
    }

    /** @dev Update DAI contract address if necessary
     */
    function setDAIContract(address DAI_contract) public {
        require(owner == msg.sender, 'Only the owner can update the contract address');
        daitoken = DaiToken(DAI_contract); // DAI in Kovan: 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
    }

    /** @dev Process the deposit of funds when sent to this contract.
     */
    receive() external payable {
        require(msg.data.length == 0); // Check if this works
        userBalance = userBalance.add(msg.value);
        smartWalletManager.fundsAreReceived(uid, msg.value);
    }

    /** @dev Get the current balance of the smart-wallet.
     * @return uint256 The balance of the smart-wallet.
     */
    function getBalance() public view returns (uint256) {
        return userBalance;
    }

    /** @dev Transfer DAI
     */
    function transferDAItoken(address recipient, uint256 _amount) public {
        // To-do: owner check . . .
        require(_amount > 0, 'Cannot send empty or negative amount.');
        require(
            daitoken.balanceOf(address(this)) >= _amount,
            'Insufficient balance inside the smart-wallet'
        );
        daitoken.transfer(recipient, _amount);
        // emit TransferredDAItoken(recipient, _amount);
    }

    /** @dev Transfer ERC20 token
     */
    function transferERC20token(address tokenAddress, address recipient, uint256 _amount) public {
        // To-do: owner check . . .
        require(tokenAddress != address(0), 'Cannot use zero address.');
        require(_amount > 0, 'Cannot send empty or negative amount.');
        require(
            Token(tokenAddress).balanceOf(address(this)) >= _amount,
            'Insufficient balance inside the smart-wallet'
        );
        Token(tokenAddress).transfer(recipient, _amount);
        // emit TransferredERC20token(recipient, _amount);
    }
}
