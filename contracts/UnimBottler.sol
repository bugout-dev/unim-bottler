// SPDX-License-Identifier: Apache-2.0

/**
 * Authors: Moonstream Engineering (engineering@moonstream.to)
 * GitHub: https://github.com/bugout-dev/dao
 *
 * An ERC1155 implementation which uses the Moonstream DAO common storage structure for proxies.
 * EIP1155: https://eips.ethereum.org/EIPS/eip-1155
 *
 * The Moonstream contract is used to delegate calls from an EIP2535 Diamond proxy.
 *
 * This implementation is adapted from the OpenZeppelin ERC1155 implementation:
 * https://github.com/OpenZeppelin/openzeppelin-contracts/tree/6bd6b76d1156e20e45d1016f355d154141c7e5b9/contracts/token/ERC1155
 */
pragma solidity ^0.8.9;

import "@moonstream/contracts/terminus/TerminusFacet.sol";
import "@openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin-contracts/contracts/access/Ownable.sol";
import "@openzeppelin-contracts/contracts/security/Pausable.sol";
import "@openzeppelin-contracts/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract UnimBottler is Ownable, Pausable, ERC1155Holder {
    address private UNIM_ADDRESS;
    address private TERMINUS_ADDRESS;

    uint256[] private terminusPools;
    mapping(uint256 => uint256) public UNIM_VALUE_BY_POOL_ID;

    constructor(address _unimAddress, address _terminusAddress) {
        UNIM_ADDRESS = _unimAddress;
        TERMINUS_ADDRESS = _terminusAddress;
    }

    function getTerminusPools() public view returns (uint256[] memory) {
        return terminusPools;
    }

    function addTerminusPool(uint256 _poolId, uint256 bottleVolume)
        public
        onlyOwner
    {
        terminusPools.push(_poolId);
        UNIM_VALUE_BY_POOL_ID[_poolId] = bottleVolume;
    }

    function getTerminusContract() internal view returns (TerminusFacet) {
        TerminusFacet terminus = TerminusFacet(TERMINUS_ADDRESS);
        return terminus;
    }

    function getUnimContract() internal view returns (IERC20) {
        IERC20 unim = IERC20(UNIM_ADDRESS);
        return unim;
    }

    function fillBottles(uint256 _poolId, uint256 bottlesCount)
        public
        whenNotPaused
    {
        uint256 amount = UNIM_VALUE_BY_POOL_ID[_poolId] * bottlesCount;

        require(amount > 0, "This pool does not exist");

        TerminusFacet terminus = getTerminusContract();
        require(
            terminus.balanceOf(address(this), _poolId) >= bottlesCount,
            "Contract is run out of bottles"
        );

        IERC20 unim = getUnimContract();
        unim.transferFrom(msg.sender, address(this), amount);

        terminus.safeTransferFrom(
            address(this),
            msg.sender,
            _poolId,
            bottlesCount,
            ""
        );
    }

    function emptyBottles(uint256 _poolId, uint256 bottlesCount)
        public
        whenNotPaused
    {
        uint256 amount = UNIM_VALUE_BY_POOL_ID[_poolId] * bottlesCount;

        TerminusFacet terminus = getTerminusContract();
        IERC20 unim = getUnimContract();

        require(
            unim.balanceOf(address(this)) >= amount,
            "Cotract ran out of UNIM, it cannot happen"
        );

        terminus.safeTransferFrom(
            msg.sender,
            address(this),
            _poolId,
            bottlesCount,
            ""
        );
        unim.transfer(msg.sender, amount);
    }

    function getUnimAddress() public view returns (address) {
        return UNIM_ADDRESS;
    }

    function getTerminusAddress() public view returns (address) {
        return TERMINUS_ADDRESS;
    }

    function withdrawERC20(address tokenAddress, uint256 amount)
        external
        onlyOwner
    {
        IERC20 erc20Contract = IERC20(tokenAddress);
        erc20Contract.transfer(_msgSender(), amount);
    }

    function drainERC20(address tokenAddress) external onlyOwner {
        IERC20 erc20Contract = IERC20(tokenAddress);
        uint256 darkForestUnicornMilkBalance = erc20Contract.balanceOf(
            address(this)
        );
        erc20Contract.transfer(_msgSender(), darkForestUnicornMilkBalance);
    }

    // This function surrenders control of Terminus pools back to the contract owner. This is so that,
    // in case this contract is deprecated, the owner can still perform operations on the shadowcorn
    // eggs and lootboxes.
    function surrenderTerminusPools() external onlyOwner {
        address _owner = owner();
        TerminusFacet terminusContract = getTerminusContract();
        for (uint256 i = 0; i < terminusPools.length; i++) {
            terminusContract.setPoolController(terminusPools[i], _owner);
        }
    }
}
