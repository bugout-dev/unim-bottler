from typing import List
import unittest

from brownie import accounts
from brownie.exceptions import VirtualMachineError


from . import BottlerFacet
from .core import facet_cut
from .test_core import BottlerTestCase


class TestBottlerContract(BottlerTestCase):
    def test_fill_small_bottles_with_no_value(self):
        pool_number = 0
        filler_account = accounts[1]
        unim_value = self.bottler.get_volume_by_index(pool_number)

        with self.assertRaises(VirtualMachineError):
            self.bottler.get_volume_by_index(10)

        self.unim.mint(filler_account.address, unim_value, {"from": accounts[0]})
        self.unim.approve(
            self.bottler.address,
            unim_value,
            {"from": filler_account},
        )

        filler_unim_balance_0 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )

        with self.assertRaises(VirtualMachineError):
            self.bottler.fill_bottles(pool_number, 1, {"from": filler_account})

        filler_unim_balance_1 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_inventory_1 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )

        self.assertEqual(filler_unim_balance_1, filler_unim_balance_0)
        self.assertEqual(contract_unim_balance_1, contract_unim_balance_0)
        self.assertListEqual(filler_inventory_1, filler_inventory_0)

    def test_fill_small_bottles(self):
        pool_number = 0
        filler_account = accounts[1]
        unim_value = self.bottler.get_volume_by_index(pool_number)

        self.unim.mint(
            filler_account.address,
            4 * unim_value,
            {"from": accounts[0]},
        )
        self.unim.approve(
            self.bottler.address,
            4 * unim_value,
            {"from": filler_account},
        )

        filler_balance_0 = filler_account.balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )

        with self.assertRaises(VirtualMachineError):
            # BottlerFacet:getVolumeByIndex - index out of bounds
            self.bottler.fill_bottles(
                10,
                4,
                {
                    "from": filler_account,
                    "value": 4 * self.full_bottle_prices[pool_number],
                },
            )
        with self.assertRaises(VirtualMachineError):
            # BottlerFacet:fillBottles - Not enough value sent in transaction
            self.bottler.fill_bottles(
                pool_number,
                5,
                {
                    "from": filler_account,
                    "value": 4 * self.full_bottle_prices[pool_number],
                },
            )
        self.bottler.fill_bottles(
            pool_number,
            4,
            {
                "from": filler_account,
                "value": 4 * self.full_bottle_prices[pool_number],
            },
        )
        with self.assertRaises(VirtualMachineError):
            # ERC20: transfer amount exceeds balance
            self.bottler.fill_bottles(
                pool_number,
                1,
                {
                    "from": filler_account,
                    "value": 1 * self.full_bottle_prices[pool_number],
                },
            )

        filler_balance_1 = filler_account.balance()
        controller_balance_1 = accounts[0].balance()
        filler_unim_balance_1 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_inventory_1 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )

        self.assertEqual(
            filler_balance_1,
            filler_balance_0 - 4 * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            controller_balance_1,
            controller_balance_0 + 4 * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            filler_unim_balance_1,
            filler_unim_balance_0 - 4 * unim_value,
        )
        self.assertEqual(
            contract_unim_balance_1,
            contract_unim_balance_0 + 4 * unim_value,
        )
        self.assertListEqual(
            filler_inventory_1,
            [filler_inventory_0[0] + 4, *filler_inventory_0[1:]],
        )

    def test_empty_medium_bottles(self):
        pool_number = 1
        filler_account = accounts[1]
        unim_value = self.bottler.get_volume_by_index(pool_number)

        self.unim.mint(
            filler_account.address,
            3 * unim_value,
            {"from": accounts[0]},
        )
        self.unim.approve(
            self.bottler.address,
            3 * unim_value,
            {"from": filler_account},
        )

        filler_balance_0 = filler_account.balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_full_inventory_0 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )
        filler_empty_inventory_0 = list(
            self.bottler.get_empty_bottle_inventory(filler_account.address)
        )

        # Fill bottles
        self.bottler.fill_bottles(
            pool_number,
            3,
            {
                "from": filler_account,
                "value": 3 * self.full_bottle_prices[pool_number],
            },
        )

        filler_balance_1 = filler_account.balance()
        controller_balance_1 = accounts[0].balance()
        filler_unim_balance_1 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_full_inventory_1 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )
        filler_empty_inventory_1 = list(
            self.bottler.get_empty_bottle_inventory(filler_account.address)
        )

        self.assertEqual(
            filler_balance_1,
            filler_balance_0 - 3 * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            controller_balance_1,
            controller_balance_0 + 3 * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            filler_unim_balance_1,
            filler_unim_balance_0 - 3 * unim_value,
        )
        self.assertEqual(
            contract_unim_balance_1,
            contract_unim_balance_0 + 3 * unim_value,
        )
        self.assertListEqual(
            filler_full_inventory_1,
            [
                filler_full_inventory_0[0],
                filler_full_inventory_0[1] + 3,
                filler_full_inventory_0[2],
            ],
        )
        self.assertListEqual(
            filler_empty_inventory_1,
            [
                filler_empty_inventory_0[0],
                filler_empty_inventory_0[1],
                filler_empty_inventory_0[2],
            ],
        )

        # Empty bottles
        self.bottler.empty_bottles(pool_number, 2, {"from": filler_account})

        with self.assertRaises(VirtualMachineError):
            # ERC1155WithTerminusStorage: burn amount exceeds balance
            self.bottler.empty_bottles(
                pool_number - 1,
                1,
                {"from": filler_account},
            )
        with self.assertRaises(VirtualMachineError):
            # BottlerFacet:emptyBottles - Contract ran out of UNIM, it cannot happen
            self.bottler.empty_bottles(pool_number, 2, {"from": filler_account})

        filler_balance_2 = filler_account.balance()
        controller_balance_2 = accounts[0].balance()

        filler_unim_balance_2 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_2 = self.unim.balance_of(self.bottler.address)

        filler_full_inventory_2 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )
        filler_empty_inventory_2 = list(
            self.bottler.get_empty_bottle_inventory(filler_account.address)
        )

        self.assertEqual(filler_balance_2, filler_balance_1)
        self.assertEqual(controller_balance_2, controller_balance_1)
        self.assertEqual(filler_unim_balance_2, filler_unim_balance_1 + 2 * unim_value)
        self.assertEqual(
            contract_unim_balance_2, contract_unim_balance_1 - 2 * unim_value
        )
        self.assertListEqual(
            filler_full_inventory_2,
            [
                filler_full_inventory_1[0],
                filler_full_inventory_1[1] - 2,
                filler_full_inventory_1[2],
            ],
        )
        self.assertListEqual(
            filler_empty_inventory_2,
            [
                filler_empty_inventory_1[0],
                filler_empty_inventory_1[1] + 2,
                filler_empty_inventory_1[2],
            ],
        )

    def test_fill_large_empty_bottles(self):
        pool_number = 2
        filler_account = accounts[1]
        unim_value = self.bottler.get_volume_by_index(pool_number)

        self.unim.mint(
            filler_account.address,
            2 * unim_value,
            {"from": accounts[0]},
        )
        self.unim.approve(
            self.bottler.address,
            (2 + 1) * unim_value,
            {"from": filler_account},
        )

        filler_balance_0 = filler_account.balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_full_inventory_0 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )
        filler_empty_inventory_0 = list(
            self.bottler.get_empty_bottle_inventory(filler_account.address)
        )

        # Fill bottles
        self.bottler.fill_bottles(
            pool_number,
            2,
            {
                "from": filler_account,
                "value": 2 * self.full_bottle_prices[pool_number],
            },
        )

        filler_balance_1 = filler_account.balance()
        controller_balance_1 = accounts[0].balance()
        filler_unim_balance_1 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_full_inventory_1 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )
        filler_empty_inventory_1 = list(
            self.bottler.get_empty_bottle_inventory(filler_account.address)
        )

        self.assertEqual(
            filler_balance_1,
            filler_balance_0 - 2 * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            controller_balance_1,
            controller_balance_0 + 2 * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            filler_unim_balance_1,
            filler_unim_balance_0 - 2 * unim_value,
        )
        self.assertEqual(
            contract_unim_balance_1,
            contract_unim_balance_0 + 2 * unim_value,
        )
        self.assertListEqual(
            filler_full_inventory_1,
            [
                *filler_full_inventory_0[:2],
                filler_full_inventory_0[2] + 2,
            ],
        )
        self.assertListEqual(
            filler_empty_inventory_1,
            filler_empty_inventory_0,
        )

        # Empty bottles
        self.bottler.empty_bottles(pool_number, 1, {"from": filler_account})

        filler_balance_2 = filler_account.balance()
        controller_balance_2 = accounts[0].balance()
        filler_unim_balance_2 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_2 = self.unim.balance_of(self.bottler.address)
        filler_full_inventory_2 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )
        filler_empty_inventory_2 = list(
            self.bottler.get_empty_bottle_inventory(filler_account.address)
        )

        self.assertEqual(filler_balance_2, filler_balance_1)
        self.assertEqual(controller_balance_2, controller_balance_1)
        self.assertEqual(
            filler_unim_balance_2,
            filler_unim_balance_1 + 1 * unim_value,
        )
        self.assertEqual(
            contract_unim_balance_2,
            contract_unim_balance_1 - 1 * unim_value,
        )
        self.assertListEqual(
            filler_full_inventory_2,
            [
                *filler_full_inventory_1[:2],
                filler_full_inventory_1[2] - 1,
            ],
        )
        self.assertListEqual(
            filler_empty_inventory_2,
            [
                *filler_empty_inventory_1[:2],
                filler_empty_inventory_1[2] + 1,
            ],
        )

        # Fill empty bottles back
        with self.assertRaises(VirtualMachineError):
            # BottlerFacet:getVolumeByIndex - index out of bounds
            self.bottler.fill_empty_bottles(10, 1, {"from": filler_account})
        with self.assertRaises(VirtualMachineError):
            # BottlerFacet:fillEmptyBottles - Sender does not have enough empty bottles
            self.bottler.fill_empty_bottles(pool_number, 10, {"from": filler_account})

        self.bottler.fill_empty_bottles(pool_number, 1, {"from": filler_account})

        filler_balance_3 = filler_account.balance()
        controller_balance_3 = accounts[0].balance()
        filler_unim_balance_3 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_3 = self.unim.balance_of(self.bottler.address)
        filler_full_inventory_3 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )
        filler_empty_inventory_3 = list(
            self.bottler.get_empty_bottle_inventory(filler_account.address)
        )

        self.assertEqual(filler_balance_3, filler_balance_2)
        self.assertEqual(controller_balance_3, controller_balance_2)
        self.assertEqual(
            filler_unim_balance_3,
            filler_unim_balance_2 - 1 * unim_value,
        )
        self.assertEqual(
            contract_unim_balance_3,
            contract_unim_balance_2 + 1 * unim_value,
        )
        self.assertListEqual(
            filler_full_inventory_3,
            [
                *filler_full_inventory_2[:2],
                filler_full_inventory_2[2] + 1,
            ],
        )
        self.assertListEqual(
            filler_empty_inventory_3,
            [
                *filler_empty_inventory_2[:2],
                filler_empty_inventory_2[2] - 1,
            ],
        )


if __name__ == "__main__":
    unittest.main()
