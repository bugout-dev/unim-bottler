// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "@moonstream/contracts/terminus/TerminusFacet.sol";
import "@openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin-contracts/contracts/access/Ownable.sol";
import "@openzeppelin-contracts/contracts/security/Pausable.sol";
import "@openzeppelin-contracts/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "../diamond/libraries/LibDiamond.sol";
import "./LibBottler.sol";

contract BottlerFacet is Ownable, Pausable, ERC1155Holder {
    constructor(address _unimAddress, address _terminusAddress) {
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.controller = msg.sender;

        bs.unimAddress = _unimAddress;
        bs.terminusAddress = _terminusAddress;
    }

    function bottlerController() external view returns (address) {
        return LibBottler.bottlerStorage().controller;
    }

    function getTerminusPools() public view returns (uint256[] memory) {
        return LibBottler.bottlerStorage().terminusPools;
    }

    // ??? onlyOnwer ???
    function addTerminusPool(uint256 _poolId, uint256 _bottleVolume)
        public
        onlyOwner
    {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.terminusPools.push(_poolId);
        bs.unimValueByPoolId[_poolId] = _bottleVolume;
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

    function fillBottles(uint256 _poolId, uint256 _bottlesCount)
        public
        whenNotPaused
    {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();

        uint256 amount = bs.unimValueByPoolId[_poolId] * _bottlesCount;

        require(amount > 0, "This pool does not exist");

        TerminusFacet terminus = getTerminusContract();
        require(
            terminus.balanceOf(address(this), _poolId) >= _bottlesCount,
            "Contract is run out of bottles"
        );

        IERC20 unim = getUnimContract();
        unim.transferFrom(msg.sender, address(this), amount);

        terminus.safeTransferFrom(
            address(this),
            msg.sender,
            _poolId,
            _bottlesCount,
            ""
        );
    }

    function emptyBottles(uint256 _poolId, uint256 _bottlesCount)
        public
        whenNotPaused
    {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();

        uint256 amount = bs.unimValueByPoolId[_poolId] * _bottlesCount;

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
            _bottlesCount,
            ""
        );
        unim.transfer(msg.sender, amount);
    }

    function getUnimAddress() public view returns (address) {
        return LibBottler.bottlerStorage().unimAddress;
    }

    function getTerminusAddress() public view returns (address) {
        return LibBottler.bottlerStorage().terminusAddress;
    }

    // withdrawERC20 ???
    // drainERC20 ???

    // This function surrenders control of Terminus pools back to the contract owner. This is so that,
    // in case this contract is deprecated, the owner can still perform operations on unicorn milk bottles.
    function surrenderTerminusPools() external onlyOwner {
        LibBottler.enforceIsController();
        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();

        address _owner = owner();
        TerminusFacet terminusContract = getTerminusContract();
        for (uint256 i = 0; i < bs.terminusPools.length; i++) {
            terminusContract.setPoolController(bs.terminusPools[i], _owner);
        }
    }
}
