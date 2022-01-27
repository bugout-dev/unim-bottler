// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "@openzeppelin-contracts/contracts/token/ERC1155/IERC1155.sol";
import "../diamond/libraries/LibDiamond.sol";
import "./LibBottler.sol";

contract BollerInitializer {
    function init() external {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC1155).interfaceId] = true;

        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.controller = msg.sender;
    }
}
