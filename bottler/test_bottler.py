from typing import List
import unittest

from brownie import accounts
from brownie.exceptions import VirtualMachineError


from . import BottlerFacet
from .core import facet_cut
from .test_core import BottlerTestCase, DECIMALS


class TestBottlerContract(BottlerTestCase):
    def test_fill_small_bottles_with_no_value(self):
        address = accounts[1].address
        self.unim.mint(address, 500 * DECIMALS, {"from": accounts[0]})
        self.unim.approve(self.bottler.address, 500 * DECIMALS, {"from": accounts[1]})

        filler_unim_balance_0 = self.unim.balance_of(address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(self.bottler.get_full_bottle_inventory(address))

        with self.assertRaises(VirtualMachineError):
            self.bottler.fill_bottles(0, 1, {"from": accounts[1]})

        filler_unim_balance_1 = self.unim.balance_of(address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_inventory_1 = list(self.bottler.get_full_bottle_inventory(address))
        self.assertEqual(filler_unim_balance_1, filler_unim_balance_0)
        self.assertEqual(contract_unim_balance_1, contract_unim_balance_0)
        self.assertListEqual(filler_inventory_1, filler_inventory_0)

    def test_fill_small_bottles(self):
        bottle_count = 4
        address = accounts[1].address
        self.unim.mint(address, bottle_count * 500 * DECIMALS, {"from": accounts[0]})
        self.unim.approve(self.bottler.address, bottle_count * 500 * DECIMALS, {"from": accounts[1]})
        filler_balance_0 = accounts[1].balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(self.bottler.get_full_bottle_inventory(address))

        self.bottler.fill_bottles(0, bottle_count, {"from": accounts[1], "value": bottle_count * self.full_bottle_prices[0]})

        filler_balance_1 = accounts[1].balance()
        controller_balance_1 = accounts[0].balance()
        filler_unim_balance_1 = self.unim.balance_of(address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_inventory_1 = list(self.bottler.get_full_bottle_inventory(address))
        self.assertEqual(filler_balance_1, filler_balance_0 - bottle_count * self.full_bottle_prices[0])
        self.assertEqual(controller_balance_1, controller_balance_0 + bottle_count * self.full_bottle_prices[0])
        self.assertEqual(filler_unim_balance_1, filler_unim_balance_0 - bottle_count * 500 * DECIMALS)
        self.assertEqual(contract_unim_balance_1, contract_unim_balance_0 + bottle_count * 500 * DECIMALS)
        self.assertListEqual(filler_inventory_1, [filler_inventory_0[0] + bottle_count, *filler_inventory_0[1:]])


if __name__ == "__main__":
    unittest.main()
