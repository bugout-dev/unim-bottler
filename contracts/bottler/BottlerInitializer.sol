// SPDX-License-Identifier: Apache-2.0

/**
 * Authors: Moonstream Engineering (engineering@moonstream.to)
 * GitHub: https://github.com/bugout-dev/dao
 *
 */

pragma solidity ^0.8.9;

import "@openzeppelin-contracts/contracts/token/ERC1155/IERC1155Receiver.sol";
import "../diamond/libraries/LibDiamond.sol";
import "./LibBottler.sol";

contract BottlerInitializer {
    function init() external {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC1155Receiver).interfaceId] = true;

        LibBottler.BottlerStorage storage bs = LibBottler.bottlerStorage();
        bs.controller = msg.sender;
    }
}
