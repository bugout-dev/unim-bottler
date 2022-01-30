from typing import cast
import unittest

from brownie import accounts, network

from bottler.BottlerFacet import BottlerFacet
from bottler.OwnershipFacet import OwnershipFacet

from .core import gogogo

from . import MockTerminus, MockErc20

DECIMALS = 10 ** 18


class BottlerDeploymentTestCase(unittest.TestCase):
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


class BottlerTestCase(BottlerDeploymentTestCase):
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

        cls.bottle_capacities = [5000, 1000, 500]
        bottler.set_bottle_capacities(cls.bottle_capacities, {"from": accounts[0]})

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
        # Using DECIMALS/1000000 so we don't have to mess with value per account in Ganache config via Brownie.
        cls.full_bottle_prices = [
            1 * DECIMALS / 1000000,
            4 * DECIMALS / 1000000,
            24 * DECIMALS / 1000000,
        ]
        bottler.set_full_bottle_prices(cls.full_bottle_prices, {"from": accounts[0]})

    def test_contract_setup(self):
        prices = self.bottler.get_full_bottle_prices()
        self.assertListEqual(list(prices), self.full_bottle_prices)

        full_bottle_pool_ids = list(self.bottler.get_full_bottle_pool_ids())
        self.assertCountEqual(full_bottle_pool_ids, self.pool_ids["full"])

        empty_bottle_pool_ids = list(self.bottler.get_empty_bottle_pool_ids())
        self.assertCountEqual(empty_bottle_pool_ids, self.pool_ids["empty"])

        capacities = self.bottler.get_bottle_capacities()
        self.assertCountEqual(capacities, self.bottle_capacities)

        unim_address = self.bottler.get_unim_address()
        self.assertEqual(unim_address, self.unim.address)

        terminus_address = self.bottler.get_terminus_address()
        self.assertEqual(terminus_address, self.terminus.address)


if __name__ == "__main__":
    unittest.main()
