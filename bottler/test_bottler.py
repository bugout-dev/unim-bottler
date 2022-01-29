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

        self.unim.mint(
            filler_account.address, self.small_bottle_unim_volume, {"from": accounts[0]}
        )
        self.unim.approve(
            self.bottler.address,
            self.small_bottle_unim_volume,
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

        self.unim.mint(
            filler_account.address,
            self.small_bottle_count * self.small_bottle_unim_volume,
            {"from": accounts[0]},
        )
        self.unim.approve(
            self.bottler.address,
            self.small_bottle_count * self.small_bottle_unim_volume,
            {"from": filler_account},
        )

        filler_balance_0 = filler_account.balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )

        self.bottler.fill_bottles(
            pool_number,
            self.small_bottle_count,
            {
                "from": filler_account,
                "value": self.small_bottle_count * self.full_bottle_prices[pool_number],
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
            filler_balance_0
            - self.small_bottle_count * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            controller_balance_1,
            controller_balance_0
            + self.small_bottle_count * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            filler_unim_balance_1,
            filler_unim_balance_0
            - self.small_bottle_count * self.small_bottle_unim_volume,
        )
        self.assertEqual(
            contract_unim_balance_1,
            contract_unim_balance_0
            + self.small_bottle_count * self.small_bottle_unim_volume,
        )
        self.assertListEqual(
            filler_inventory_1,
            [filler_inventory_0[0] + self.small_bottle_count, *filler_inventory_0[1:]],
        )

    def test_empty_medium_bottles(self):
        pool_number = 1
        filler_account = accounts[1]

        self.unim.mint(
            filler_account.address,
            self.medium_bottle_count * self.medium_bottle_unim_volume,
            {"from": accounts[0]},
        )
        self.unim.approve(
            self.bottler.address,
            self.medium_bottle_count * self.medium_bottle_unim_volume,
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
            self.medium_bottle_count,
            {
                "from": filler_account,
                "value": self.medium_bottle_count
                * self.full_bottle_prices[pool_number],
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
            filler_balance_0
            - self.medium_bottle_count * self.full_bottle_prices[pool_number],
        )

        self.assertEqual(
            controller_balance_1,
            controller_balance_0
            + self.medium_bottle_count * self.full_bottle_prices[pool_number],
        )

        self.assertEqual(
            filler_unim_balance_1,
            filler_unim_balance_0
            - self.medium_bottle_count * self.medium_bottle_unim_volume,
        )

        self.assertEqual(
            contract_unim_balance_1,
            contract_unim_balance_0
            + self.medium_bottle_count * self.medium_bottle_unim_volume,
        )

        self.assertListEqual(
            filler_full_inventory_1,
            [
                filler_full_inventory_0[0],
                filler_full_inventory_0[1] + self.medium_bottle_count,
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

        self.bottler.empty_bottles(
            pool_number, self.medium_bottle_count_empty, {"from": filler_account}
        )

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
            filler_unim_balance_1
            + self.medium_bottle_count_empty * self.medium_bottle_unim_volume,
        )

        self.assertEqual(
            contract_unim_balance_2,
            contract_unim_balance_1
            - self.medium_bottle_count_empty * self.medium_bottle_unim_volume,
        )

        self.assertListEqual(
            filler_full_inventory_2,
            [
                filler_full_inventory_1[0],
                filler_full_inventory_1[1] - self.medium_bottle_count_empty,
                filler_full_inventory_1[2],
            ],
        )

        self.assertListEqual(
            filler_empty_inventory_2,
            [
                filler_empty_inventory_1[0],
                filler_empty_inventory_1[1] + self.medium_bottle_count_empty,
                filler_empty_inventory_1[2],
            ],
        )

    def test_fill_large_empty_bottles(self):
        pool_number = 2
        filler_account = accounts[1]

        self.unim.mint(
            filler_account.address,
            self.large_bottle_count * self.large_bottle_unim_volume,
            {"from": accounts[0]},
        )
        self.unim.approve(
            self.bottler.address,
            (self.large_bottle_count + self.large_bottle_count_empty)
            * self.large_bottle_unim_volume,
            {"from": filler_account},
        )

        filler_balance_0 = filler_account.balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(filler_account.address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(
            self.bottler.get_full_bottle_inventory(filler_account.address)
        )

        # Fill bottles
        self.bottler.fill_bottles(
            pool_number,
            self.large_bottle_count,
            {
                "from": filler_account,
                "value": self.large_bottle_count * self.full_bottle_prices[pool_number],
            },
        )
        # Empty bottles
        self.bottler.empty_bottles(
            pool_number, self.large_bottle_count_empty, {"from": filler_account}
        )
        # Fill empty bottles back
        self.bottler.fill_empty_bottles(
            pool_number, self.large_bottle_count_empty, {"from": filler_account}
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
            filler_balance_0
            - self.large_bottle_count * self.full_bottle_prices[pool_number],
        )
        self.assertEqual(
            controller_balance_1,
            controller_balance_0
            + self.large_bottle_count * self.full_bottle_prices[pool_number],
        )
        # self.assertEqual(filler_unim_balance_1, filler_unim_balance_0 - bottle_count * bottle_price * DECIMALS)
        # self.assertEqual(contract_unim_balance_1, contract_unim_balance_0 + bottle_count * bottle_price * DECIMALS)
        self.assertEqual(
            filler_inventory_1,
            [
                *filler_inventory_1[0:pool_number],
                filler_inventory_0[pool_number] + self.large_bottle_count,
            ],
        )


if __name__ == "__main__":
    unittest.main()
