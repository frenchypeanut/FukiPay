pragma solidity ^0.6.2;

import '@nomiclabs/buidler/console.sol';
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/** Simple ERC-20 token for testing using EIP-20 standard https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 */
contract SimpleERC20Token is ERC20 {
    constructor(uint256 initialSupply) ERC20("BlockHub Token", "BHT") public {
        _mint(msg.sender, initialSupply);
    }
}
