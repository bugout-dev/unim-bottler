from typing import List
import unittest

from brownie import accounts


from . import BottlerFacet
from .core import facet_cut
from .test_core import BottlerTestCase

DECIMALS = 10 ** 18


class TestBottlerContract(BottlerTestCase):
    def test_fill_small_bottles(self):
        address = accounts[1].address
        self.unim.mint(address, 500 * DECIMALS, {"from": accounts[0]})
        self.unim.approve(self.bottler.address, 500 * DECIMALS, {"from": accounts[1]})

        self.bottler.fill_small_bottles(1, {"from": accounts[1]})

        self.assertEqual(self.unim.balance_of(address), 0)
        self.assertEqual(self.bottler.get_full_bottle_inventory(address), [1, 0, 0])

    # def test_fill_small_bottles_with_insufficient_funds(self):
    #     address = accounts[1].address
    #     self.unim.mint(address, 500 * DECIMALS, {"from": accounts[1]})
    #     self.unim.approve(self.bottler.address, 500 * DECIMALS, {"from": address})

    #     with self.assertRaises(Exception):
    #         self.bottler.fill_small_bottles(2, {"from": accounts[1]})


if __name__ == "__main__":
    unittest.main()
