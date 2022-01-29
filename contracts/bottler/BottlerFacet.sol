// SPDX-License-Identifier: Apache-2.0

/**
 * Authors: Moonstream Engineering (engineering@moonstream.to)
 * GitHub: https://github.com/bugout-dev/dao
 */

pragma solidity ^0.8.9;

import "@moonstream/contracts/terminus/TerminusFacet.sol";
import "@openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin-contracts/contracts/access/Ownable.sol";
import "@openzeppelin-contracts/contracts/security/Pausable.sol";
import "@openzeppelin-contracts/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "./LibBottler.sol";

contract BottlerFacet is ERC1155Holder {
    function setUp(address _unimAddress, address _terminusAddress) external {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.unimAddress = _unimAddress;
        bs.terminusAddress = _terminusAddress;
    }

    function bottlerController() external view returns (address) {
        return LibBottler.bottlerStorage().controller;
    }

    function getFullBottlePoolIds() public view returns (uint256[3] memory) {
        return LibBottler.bottlerStorage().fullBottlePoolIds;
    }

    function getEmptyBottlePoolIds() public view returns (uint256[3] memory) {
        return LibBottler.bottlerStorage().emptyBottlePoolIds;
    }

    function getFullBottlePrices() external view returns (uint256[3] memory) {
        return LibBottler.bottlerStorage().fullBottlePrices;
    }

    function setFullBottlePrices(uint256[3] memory prices) external {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.fullBottlePrices = prices;
    }

    function getTerminusContract() internal view returns (TerminusFacet) {
        address terminusAddress = LibBottler.bottlerStorage().terminusAddress;
        TerminusFacet terminus = TerminusFacet(terminusAddress);
        return terminus;
    }

    function getUnimContract() internal view returns (IERC20) {
        address unimAddress = LibBottler.bottlerStorage().unimAddress;
        IERC20 unim = IERC20(unimAddress);
        return unim;
    }

    function getVolumeByIndex(uint256 index) public view returns (uint256) {
        require(
            index < 3,
            "BottlerFacet:getVolumeByIndex - index out of bounds"
        );
        if (index == 0) {
            return LibBottler.SMALL_BOTTLE_UNIM_VOLUME;
        } else if (index == 1) {
            return LibBottler.MEDIUM_BOTTLE_UNIM_VOLUME;
        } else if (index == 2) {
            return LibBottler.LARGE_BOTTLE_UNIM_VOLUME;
        }
    }

    function fillBottles(uint256 poolIndex, uint256 bottlesCount)
        external
        payable
    {
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();

        uint256 amount = getVolumeByIndex(poolIndex) * bottlesCount;
        require(
            amount > 0,
            "BottlerFacet:fillBottles - This pool does not exist"
        );

        uint256 totalPrice = bottlesCount * bs.fullBottlePrices[poolIndex];
        require(
            msg.value >= totalPrice,
            "BottlerFacet:fillBottles - Not enough value sent in transaction"
        );

        TerminusFacet terminus = getTerminusContract();
        uint256 fullBottlePoolId = bs.fullBottlePoolIds[poolIndex];
        uint256 emptyBottlePoolId = bs.emptyBottlePoolIds[poolIndex];

        require(
            terminus.terminusPoolSupply(fullBottlePoolId) +
                terminus.terminusPoolSupply(emptyBottlePoolId) +
                bottlesCount <=
                bs.bottleCapacities[poolIndex],
            "BottlerFacet:fillBottles - Not enough empty bottles available"
        );

        IERC20 unim = getUnimContract();
        unim.transferFrom(msg.sender, address(this), amount);

        payable(bs.controller).transfer(totalPrice);
        terminus.mint(msg.sender, fullBottlePoolId, bottlesCount, "");
    }

    function fillEmptyBottles(uint256 poolIndex, uint256 bottlesCount) public {
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();

        uint256 amount = getVolumeByIndex(poolIndex) * bottlesCount;
        require(
            amount > 0,
            "BottlerFacet:fillEmptyBottles - This pool does not exist"
        );

        TerminusFacet terminus = getTerminusContract();
        uint256 fullBottlePoolId = bs.fullBottlePoolIds[poolIndex];
        uint256 emptyBottlePoolId = bs.emptyBottlePoolIds[poolIndex];

        require(
            terminus.balanceOf(msg.sender, emptyBottlePoolId) >= bottlesCount,
            "BottlerFacet:fillEmptyBottles - Sender does not have enough empty bottles"
        );

        IERC20 unim = getUnimContract();
        unim.transferFrom(msg.sender, address(this), amount);
        terminus.mint(msg.sender, fullBottlePoolId, bottlesCount, "");
        terminus.burn(msg.sender, emptyBottlePoolId, bottlesCount);
    }

    function emptyBottles(uint256 poolIndex, uint256 bottlesCount) external {
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();

        uint256 amount = getVolumeByIndex(poolIndex) * bottlesCount;

        TerminusFacet terminus = getTerminusContract();
        IERC20 unim = getUnimContract();

        require(
            unim.balanceOf(address(this)) >= amount,
            "BottlerFacet:emptyBottles - Contract ran out of UNIM, it cannot happen"
        );

        uint256 fullBottlePoolId = bs.fullBottlePoolIds[poolIndex];
        uint256 emptyBottlePoolId = bs.emptyBottlePoolIds[poolIndex];

        terminus.burn(msg.sender, fullBottlePoolId, bottlesCount);

        terminus.mint(msg.sender, emptyBottlePoolId, bottlesCount, "");

        unim.transfer(msg.sender, amount);
    }

    function getBottleCapacities() external view returns (uint256[3] memory) {
        return LibBottler.bottlerStorage().bottleCapacities;
    }

    function getFullBottleSupplies() external view returns (uint256[3] memory) {
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        TerminusFacet terminus = getTerminusContract();
        uint256[3] memory fullBottleSupplies;

        for (uint256 i = 0; i < 3; i++) {
            fullBottleSupplies[i] = terminus.terminusPoolSupply(
                bs.fullBottlePoolIds[i]
            );
        }
        return fullBottleSupplies;
    }

    function setBottleCapacities(uint256[3] memory newBottleCapacities)
        external
    {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.bottleCapacities = newBottleCapacities;
    }

    function setFullBottlePoolIds(uint256[3] memory newFullBottlePoolIds)
        external
    {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.fullBottlePoolIds = newFullBottlePoolIds;
    }

    function setEmptyBottlePoolIds(uint256[3] memory newEmptyBottlePoolIds)
        external
    {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.emptyBottlePoolIds = newEmptyBottlePoolIds;
    }

    function getEmptyBottleSupplies()
        external
        view
        returns (uint256[3] memory)
    {
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        TerminusFacet terminus = getTerminusContract();
        uint256[3] memory emptyBottleSupplies;
        for (uint256 i = 0; i < 3; i++) {
            emptyBottleSupplies[i] = terminus.terminusPoolSupply(
                bs.emptyBottlePoolIds[i]
            );
        }

        return emptyBottleSupplies;
    }

    function getFullBottleInventory(address owner)
        external
        view
        returns (uint256[3] memory)
    {
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        TerminusFacet terminus = getTerminusContract();
        uint256[3] memory fullBottleInventory;

        for (uint256 i = 0; i < 3; i++) {
            fullBottleInventory[i] = terminus.balanceOf(
                owner,
                bs.fullBottlePoolIds[i]
            );
        }
        return fullBottleInventory;
    }

    function getEmptyBottleInventory(address owner)
        external
        view
        returns (uint256[3] memory)
    {
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        TerminusFacet terminus = getTerminusContract();
        uint256[3] memory emptyBottleInventory;
        for (uint256 i = 0; i < 3; i++) {
            emptyBottleInventory[i] = terminus.balanceOf(
                owner,
                bs.emptyBottlePoolIds[i]
            );
        }
        return emptyBottleInventory;
    }

    function getUnimAddress() external view returns (address) {
        return LibBottler.bottlerStorage().unimAddress;
    }

    function getTerminusAddress() external view returns (address) {
        return LibBottler.bottlerStorage().terminusAddress;
    }

    function withdrawERC20(address tokenAddress, uint256 amount) public {
        LibBottler.enforceIsController();
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender, amount);
    }

    function drainERC20(address tokenAddress) public {
        LibBottler.enforceIsController();
        IERC20 token = IERC20(tokenAddress);
        uint256 amount = token.balanceOf(address(this));
        token.transfer(address(this), amount);
    }

    // This function surrenders control of Terminus pools back to the contract owner. This is so that,
    // in case this contract is deprecated, the owner can still perform operations on unicorn milk bottles.
    function surrenderTerminusPools() external {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();

        address _owner = bs.controller;
        TerminusFacet terminusContract = getTerminusContract();
        for (uint256 i = 0; i < 3; i++) {
            terminusContract.setPoolController(bs.fullBottlePoolIds[i], _owner);
            terminusContract.setPoolController(
                bs.emptyBottlePoolIds[i],
                _owner
            );
        }
    }

    function setTerminusPoolURI(uint256 poolId, string memory uri) external {
        LibBottler.enforceIsController();
        TerminusFacet terminus = getTerminusContract();
        terminus.setURI(poolId, uri);
    }
}
