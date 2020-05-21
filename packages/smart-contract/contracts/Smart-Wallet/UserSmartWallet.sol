pragma solidity ^0.6.2;

import '@nomiclabs/buidler/console.sol';
import './SmartWalletManager.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC777/IERC777.sol';
import '@openzeppelin/contracts/introspection/IERC1820Registry.sol';
import '@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol';
import '@openzeppelin/contracts/token/ERC777/IERC777Sender.sol';
import '@openzeppelin/contracts/introspection/ERC1820Implementer.sol';


// Adding the ERC-20 functions we need for DAI
interface DaiToken {
    function balanceOf(address guy) external view returns (uint256);

    function transfer(address dst, uint256 wad) external returns (bool);
}


// Adding the ERC-20 functions we need for a token
interface Token {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}


// Adding the ERC-20 functions we need for Aave tokens
interface aToken {
    function redeem(uint256 _amount) external;

    function balanceOf(address _user) external view returns (uint256);
}


// Adding lending function
interface LendingPool {
    function deposit(address _reserve, uint256 _amount, uint16 _referralCode) external payable;
}


// Adding lendingpool provider functions
interface LendingPoolAddressesProvider {
    function getLendingPool() external view returns (address);

    function getLendingPoolCore() external view returns (address payable);
}


// Adding pToken peg-out function
interface pTokens {
    function redeem(uint256 amount, string calldata underlyingAssetRecipient)
        external
        returns (bool);
}


contract UserSmartWallet is IERC777Recipient, IERC777Sender, ERC1820Implementer {
    using SafeMath for uint256;
    string public uid;
    uint256 public userBalance;
    address public userBackupKey;
    bool public activated;

    SmartWalletManager private smartWalletManager;

    // To-do: uint constant public MAX_OWNER_COUNT = 10;
    // uint256 public ownersCount = 0;
    mapping (address => bool) public hasOwnerAccess;

    modifier onlyOwner() {
        require(hasOwnerAccess[msg.sender] == true, 'Caller must be the owner.');
        _;
    }

    constructor(string memory _uid) public {
        smartWalletManager = SmartWalletManager(msg.sender);
        // To-do: ownersCount = ownersCount.add(1);
        hasOwnerAccess[smartWalletManager.owner()] = true;
        require(bytes(_uid).length > 0, 'The uid cannot be empty.');
        uid = _uid;
        activated = true;
        userBalance = 0;
    }

    // function verifyOwnerAccess(address _address) public view returns(bool) {
    //     return hasOwnerAccess[_address];
    // }

    /** @dev Add a new owner address inside the smart-wallet.
     */
    function addOwner(address _newOwner) public onlyOwner returns(bool) {
        require(_newOwner != address(0), 'Cannot use zero address.');
        // To-do: require(ownersCount <= MAX_OWNER_COUNT);
        require(!hasOwnerAccess[_newOwner], 'Address already registered as owner.');
        // To-do: add vote for approval from all current owners
        // ownersCount = ownersCount.add(1);
        hasOwnerAccess[_newOwner] = true;
        return true;
    }

    /** @dev Remove a current owner address inside the smart-wallet.
     */
    function removeOwner(address _ownerToRemove) public onlyOwner returns(bool) {
        require(msg.sender != smartWalletManager.owner(), 'The SmartWalletManager should not remove owners.');
        require(_ownerToRemove != address(0), 'Cannot use zero address.');
        require(hasOwnerAccess[_ownerToRemove], 'Address is not currently registered as an owner.');
        // To-do: add vote for approval from all current owners
        // ownersCount = ownersCount.sub(1);
        hasOwnerAccess[_ownerToRemove] = false;
        return true;
    }

    /** @dev Process the deposit of funds when sent to this contract.
     */
    receive() external payable {
        require(msg.data.length == 0); // Check if this works
        userBalance = userBalance.add(msg.value);
        smartWalletManager.fundsAreReceived(uid, msg.value, msg.sender);
    }

    /** @dev Get the current balance of the smart-wallet.
     * @return uint256 The balance of the smart-wallet.
     */
    function getBalance() public view returns (uint256) {
        return userBalance;
    }

    /** @dev Transfer ETH
     */
    function transferETH(address payable recipient, uint256 _amount) public onlyOwner {
        require(_amount > 0, 'Cannot send empty or negative amount.');
        require(address(this).balance >= _amount, 'Insufficient balance inside the smart-wallet.');
        require(userBalance >= _amount, 'Insufficient balance inside the smart-wallet.');
        recipient.send(_amount);
        userBalance = userBalance.sub(_amount);
    }

    /** @dev Transfer DAI
     */
    function transferDAItoken(address tokenAddress, address recipient, uint256 _amount) public onlyOwner {
        require(tokenAddress != address(0), 'Cannot use zero address.');
        require(_amount > 0, 'Cannot send empty or negative amount.');
        require(
            DaiToken(tokenAddress).balanceOf(address(this)) >= _amount,
            'Insufficient balance inside the smart-wallet'
        );
        DaiToken(tokenAddress).transfer(recipient, _amount);
    }

    /** @dev Transfer ERC20 token
     */
    function transferERC20token(address tokenAddress, address recipient, uint256 _amount) public onlyOwner {
        require(tokenAddress != address(0), 'Cannot use zero address.');
        require(_amount > 0, 'Cannot send empty or negative amount.');
        require(
            Token(tokenAddress).balanceOf(address(this)) >= _amount,
            'Insufficient balance inside the smart-wallet'
        );
        Token(tokenAddress).transfer(recipient, _amount);
    }

    /** @dev Deposit ERC-20 tokens inside Aave liquidity pools and get aTokens in return
     */
    function depositFundsAave(address tokenAddress, uint256 _amount) public onlyOwner {
        require(tokenAddress != address(0), 'Cannot use zero address.');
        require(_amount > 0, 'Cannot send empty or negative amount.');
        require(
            Token(tokenAddress).balanceOf(address(this)) >= _amount,
            'Insufficient balance inside the smart-wallet'
        );
        // Retrieve LendingPool address
        LendingPoolAddressesProvider provider = LendingPoolAddressesProvider(
            address(0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728)
        ); // Ropsten address,
        // for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
        LendingPool lendingPool = LendingPool(provider.getLendingPool());
        uint16 referral = 0;
        // Approve LendingPool contract to move your tokens:
        Token(tokenAddress).approve(provider.getLendingPoolCore(), _amount);
        lendingPool.deposit(tokenAddress, _amount, referral);
    }

    /** @dev Deposit ERC-20 tokens inside Aave liquidity pools and get aTokens in return
     */
    function redeemAaveToken(address aTokenAddress, uint256 _amount) public onlyOwner {
        require(aTokenAddress != address(0), 'Cannot use zero address.');
        require(_amount > 0, 'Cannot send empty or negative amount.');
        require(
            aToken(aTokenAddress).balanceOf(address(this)) >= _amount,
            'Insufficient balance inside the smart-wallet'
        );
        aToken(aTokenAddress).redeem(_amount);
    }

    /** @dev Testnet Registry address
     */
    IERC1820Registry private _erc1820 = IERC1820Registry(
        0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24
    );
    bytes32 private constant TOKENS_RECIPIENT_INTERFACE_HASH = keccak256('ERC777TokensRecipient');
    bytes32 public constant TOKENS_SENDER_INTERFACE_HASH = keccak256('ERC777TokensSender');
    IERC777 private _ptoken;
    bool private _shouldRevertSend;
    bool private _shouldRevertReceive;

    /** @dev Boolean to administer receiver hook for ERC-777
     */
    function setShouldRevertReceive(bool shouldRevert) public onlyOwner {
        _shouldRevertReceive = shouldRevert;
    }

    /** @dev Boolean to administer sending hook for ERC-777
     */
    function setShouldRevertSend(bool shouldRevertSend) public onlyOwner {
        _shouldRevertSend = shouldRevertSend;
    }

    /** @dev ERC-1820 interface register
     */
    function setERC1820(address ptokenAddress) public onlyOwner {
        _ptoken = IERC777(ptokenAddress);
        _erc1820.setInterfaceImplementer(
            address(this),
            TOKENS_RECIPIENT_INTERFACE_HASH,
            address(this)
        );
    }

    /** @dev ERC-777 Receiver hook
     */
    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        if (_shouldRevertReceive) {
            revert();
        }

        require(msg.sender == address(_ptoken), 'Invalid ptoken address');

        // uint256 fromBalance = token.balanceOf(from);
        // when called due to burn, to will be the zero address, which will have a balance of 0
        // uint256 toBalance = token.balanceOf(to);

        // emit TokensReceivedCalled(
        //     operator,
        //     from,
        //     to,
        //     amount,
        //     userData,
        //     operatorData,
        //     address(token),
        //     fromBalance,
        //     toBalance
        // );
    }

    function senderFor(address account) public {
        _registerInterfaceForAddress(TOKENS_SENDER_INTERFACE_HASH, account);
    }

    /** @dev ERC-777 Transfer hook
     */
    function tokensToSend(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override onlyOwner {
        if (_shouldRevertSend) {
            revert();
        }
        // do stuff
        // emit DoneStuff(operator, from, to, amount, userData, operatorData);
    }

    /** @dev Transfer pBTC token for burning to peg-out BTC coin
     */
    function swappBTCtoBTC(address _pTokens, uint256 _amount, string memory _BTCRecipientAddress)
        public
        onlyOwner
        returns (bool)
    {
        // minimum amount that can be pegged-out from pBTC network:
        // 0.00005 pBTC with 18 decimals
        // require(_amount >= 50000000000000, 'Impossible to swap less than 0.00005 pBTC');
        return pTokens(_pTokens).redeem(_amount, _BTCRecipientAddress);
    }
}
