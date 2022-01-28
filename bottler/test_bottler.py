from typing import List
import unittest

from brownie import accounts
from brownie.exceptions import VirtualMachineError


from . import BottlerFacet
from .core import facet_cut
from .test_core import BottlerTestCase, DECIMALS

class TestBottlerContract(BottlerTestCase):
    # def test_fill_small_bottles_with_no_value(self):
    #     address = accounts[1].address
    #     self.unim.mint(address, 500 * DECIMALS, {"from": accounts[0]})
    #     self.unim.approve(self.bottler.address, 500 * DECIMALS, {"from": accounts[1]})

    #     filler_unim_balance_0 = self.unim.balance_of(address)
    #     contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
    #     filler_inventory_0 = list(self.bottler.get_full_bottle_inventory(address))

    #     with self.assertRaises(VirtualMachineError):
    #         self.bottler.fill_bottles(0, 1, {"from": accounts[1]})

    #     filler_unim_balance_1 = self.unim.balance_of(address)
    #     contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
    #     filler_inventory_1 = list(self.bottler.get_full_bottle_inventory(address))
    #     self.assertEqual(filler_unim_balance_1, filler_unim_balance_0)
    #     self.assertEqual(contract_unim_balance_1, contract_unim_balance_0)
    #     self.assertListEqual(filler_inventory_1, filler_inventory_0)

    def test_mint_unim(self):
        self.unim.mint(accounts[1].address, self.small_bottle_count * 500 * DECIMALS, {"from": accounts[0]})
        self.unim.approve(self.bottler.address, self.small_bottle_count * 500 * DECIMALS, {"from": accounts[1]})

    def test_fill_small_bottles(self):
        pool_number = 0
        address = accounts[1].address
        
        filler_balance_0 = accounts[1].balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(self.bottler.get_full_bottle_inventory(address))

        self.bottler.fill_bottles(pool_number, self.small_bottle_count, {"from": accounts[1], "value": self.small_bottle_count * self.full_bottle_prices[pool_number]})

        filler_balance_1 = accounts[1].balance()
        controller_balance_1 = accounts[0].balance()
        filler_unim_balance_1 = self.unim.balance_of(address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_inventory_1 = list(self.bottler.get_full_bottle_inventory(address))

        self.assertEqual(filler_balance_1, filler_balance_0 - self.small_bottle_count * self.full_bottle_prices[0])
        self.assertEqual(controller_balance_1, controller_balance_0 + self.small_bottle_count * self.full_bottle_prices[0])
        self.assertEqual(filler_unim_balance_1, filler_unim_balance_0 - self.small_bottle_count * 500 * DECIMALS)
        self.assertEqual(contract_unim_balance_1, contract_unim_balance_0 + self.small_bottle_count * 500 * DECIMALS)
        self.assertListEqual(filler_inventory_1, [filler_inventory_0[0] + self.small_bottle_count, *filler_inventory_0[1:]])

    def test_empty_medium_bottles(self):
        pool_number = 1
        bottle_price = self.full_bottle_prices[pool_number]

        self.unim.mint(accounts[1].address, self.medium_bottle_count * bottle_price * DECIMALS, {"from": accounts[0]})
        self.unim.approve(self.bottler.address, self.medium_bottle_count * bottle_price * DECIMALS, {"from": accounts[1]})

        filler_balance_0 = accounts[1].balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(accounts[1].address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(self.bottler.get_full_bottle_inventory(accounts[1].address))

        # Fill bottles with value `bottle_count`
        self.bottler.fill_bottles(pool_number, self.medium_bottle_count, {"from": accounts[1], "value": self.medium_bottle_count * bottle_price})
        # Empty bottles with value `empty_bottle_count`
        self.bottler.empty_bottles(pool_number, self.medium_bottle_count_empty, {"from": accounts[1]})

        filler_balance_1 = accounts[1].balance()
        controller_balance_1 = accounts[0].balance()
        filler_unim_balance_1 = self.unim.balance_of(accounts[1].address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_inventory_1 = list(self.bottler.get_full_bottle_inventory(accounts[1].address))

        self.assertEqual(filler_balance_1, filler_balance_0 - self.medium_bottle_count * bottle_price)
        self.assertEqual(controller_balance_1, controller_balance_0 + self.medium_bottle_count * bottle_price)
        # self.assertEqual(filler_unim_balance_1, filler_unim_balance_0 - bottle_count * bottle_price * DECIMALS)
        # self.assertEqual(contract_unim_balance_1, contract_unim_balance_0 + bottle_count * bottle_price * DECIMALS)
        self.assertEqual(filler_inventory_1, [filler_inventory_1[0], filler_inventory_0[pool_number] + self.medium_bottle_count - self.medium_bottle_count_empty, filler_inventory_0[2]])        
    
    def test_fill_large_empty_bottles(self):
        pool_number = 2
        bottle_price = self.full_bottle_prices[pool_number]

        self.unim.mint(accounts[1].address, self.large_bottle_count * bottle_price * DECIMALS, {"from": accounts[0]})
        self.unim.approve(self.bottler.address, self.large_bottle_count* bottle_price * DECIMALS, {"from": accounts[1]})

        filler_balance_0 = accounts[1].balance()
        controller_balance_0 = accounts[0].balance()
        filler_unim_balance_0 = self.unim.balance_of(accounts[1].address)
        contract_unim_balance_0 = self.unim.balance_of(self.bottler.address)
        filler_inventory_0 = list(self.bottler.get_full_bottle_inventory(accounts[1].address))

        # Fill bottles with value `bottle_count`
        self.bottler.fill_bottles(pool_number, self.large_bottle_count, {"from": accounts[1], "value": self.large_bottle_count * bottle_price})
        # Empty bottles with value `empty_bottle_count`
        self.bottler.empty_bottles(pool_number, self.large_bottle_count_empty, {"from": accounts[1]})
        # Fill empty bottles back
        self.bottler.fill_empty_bottles(pool_number, self.large_bottle_count_empty, {"from": accounts[1]})

        filler_balance_1 = accounts[1].balance()
        controller_balance_1 = accounts[0].balance()
        filler_unim_balance_1 = self.unim.balance_of(accounts[1].address)
        contract_unim_balance_1 = self.unim.balance_of(self.bottler.address)
        filler_inventory_1 = list(self.bottler.get_full_bottle_inventory(accounts[1].address))

        self.assertEqual(filler_balance_1, filler_balance_0 - self.large_bottle_count * bottle_price)
        self.assertEqual(controller_balance_1, controller_balance_0 + self.large_bottle_count * bottle_price)
        # self.assertEqual(filler_unim_balance_1, filler_unim_balance_0 - bottle_count * bottle_price * DECIMALS)
        # self.assertEqual(contract_unim_balance_1, contract_unim_balance_0 + bottle_count * bottle_price * DECIMALS)
        self.assertEqual(filler_inventory_1, [*filler_inventory_1[0:pool_number], filler_inventory_0[pool_number] + self.large_bottle_count])        


if __name__ == "__main__":
    unittest.main()
