// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

library LibBottler {
    bytes32 constant BOTTLER_STORAGE_POSITION =
        keccak256("moonstreamdao.eth.storage.bottler");

    struct BottlerStorage {
        address controller;
        address unimAddress;
        address terminusAddress;
        uint256[] terminusPools;
        mapping(uint256 => uint256) unimValueByPoolId;
    }

    function bottlerStorage()
        internal
        pure
        returns (BottlerStorage storage bs)
    {
        bytes32 position = BOTTLER_STORAGE_POSITION;
        assembly {
            bs.slot := position
        }
    }

    event ControlTransferred(
        address indexed previousController,
        address indexed newController
    );

    function setController(address newController) internal {
        BottlerStorage storage bs = bottlerStorage();
        address previousController = bs.controller;
        bs.controller = newController;
        emit ControlTransferred(previousController, newController);
    }

    function enforceIsController() internal view {
        BottlerStorage storage bs = bottlerStorage();
        require(msg.sender == bs.controller, "LibBottler: Must be controller");
    }
}
