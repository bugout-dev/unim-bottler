from typing import cast
import unittest

from brownie import accounts, network

from bottler.BottlerFacet import BottlerFacet
from bottler.OwnershipFacet import OwnershipFacet

from .core import facet_cut, gogogo

from . import MockTerminus, MockErc20


class BottlerSingleContractTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        try:
            network.connect()
        except:
            pass
        cls.contracts = gogogo(accounts[0].address, {"from": accounts[0]})

    def test_controller(self) -> None:
        bottler = BottlerFacet(self.contracts["Diamond"])
        ownership = OwnershipFacet(self.contracts["Diamond"])

        self.assertEqual(ownership.owner(), accounts[0].address)
        self.assertEqual(bottler.bottler_controller(), accounts[0].address)

    def test_gogogo(self):
        self.assertIn("DiamondCutFacet", self.contracts)
        self.assertIn("Diamond", self.contracts)
        self.assertIn("DiamondLoupeFacet", self.contracts)
        self.assertIn("OwnershipFacet", self.contracts)
        self.assertIn("attached", self.contracts)
        self.assertIn("BottlerFacet", self.contracts)

        self.assertListEqual(
            self.contracts["attached"],
            ["DiamondLoupeFacet", "OwnershipFacet", "BottlerFacet"],
        )


class BottlerTestCase(BottlerSingleContractTestCase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()

        cls.terminus = MockTerminus.MockTerminus(None)
        cls.terminus.deploy({"from": accounts[0]})

        cls.unim = MockErc20.MockErc20(None)
        cls.unim.deploy({"from": accounts[0]})

        cls.mnstr = MockErc20.MockErc20(None)
        cls.mnstr.deploy({"from": accounts[0]})

        cls.mnstr.mint(accounts[0], 10 ** 18, {"from": accounts[0]})

        cls.terminus.set_payment_token(cls.mnstr.address, {"from": accounts[0]})
        cls.terminus.set_pool_base_price(1, {"from": accounts[0]})

        cls.mnstr.approve(cls.terminus.address, 10 ** 18, {"from": accounts[0]})

        bottler = BottlerFacet(cls.contracts["Diamond"])
        bottler.set_up(cls.unim.address, cls.terminus.address, {"from": accounts[0]})
        bottler.set_bottle_capacities([5000, 1000, 500], {"from": accounts[0]})

        cls.bottler = bottler

        for i in range(6):
            cls.terminus.create_pool_v1(2 ** 256 - 1, True, True, {"from": accounts[0]})
            cls.terminus.set_pool_controller(
                i + 1, bottler.address, {"from": accounts[0]}
            )

        cls.pool_ids = {
            "empty": [1, 2, 3],
            "full": [4, 5, 6],
        }
        bottler.set_empty_bottle_pool_ids(cls.pool_ids["empty"], {"from": accounts[0]})
        bottler.set_full_bottle_pool_ids(cls.pool_ids["full"], {"from": accounts[0]})


if __name__ == "__main__":
    unittest.main()
