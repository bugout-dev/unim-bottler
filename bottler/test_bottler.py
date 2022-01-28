from typing import List
import unittest

from brownie import accounts

from . import BottlerFacet, BottlerInitializer
from .core import facet_cut
from .test_core import BottlerSingleContractTestCase, BottlerTestCase


class TestDeployment(BottlerSingleContractTestCase):
    def test_add_and_replace(self):
        initializer = BottlerInitializer.BottlerInitializer(None)
        initializer.deploy({"from": accounts[0]})

        bottler_facet = BottlerFacet.BottlerFacet(None)
        bottler_facet.deploy({"from": accounts[0]})

        diamond_address = self.contracts["Diamond"]
        facet_cut(
            diamond_address,
            "BottlerFacet",
            bottler_facet.address,
            "add",
            {"from": accounts[0]},
            initializer.address,
        )

        diamond_bottler = BottlerFacet.BottlerFacet(diamond_address)

        controller = diamond_bottler.bottler_controller()
        self.assertEqual(controller, accounts[0].address)


class TestGetFullBottlePoolIds(BottlerTestCase):
    def test_get_full_bottler_pool_ids(self):
        bottler_diamond_address = self.bottler_contracts["Diamond"]
        print(bottler_diamond_address)
        diamond_bottler = BottlerFacet.BottlerFacet(bottler_diamond_address)

        pool_ids = diamond_bottler.get_full_bottle_pool_ids()
        self.assertEqual(pool_ids, [])


if __name__ == "__main__":
    unittest.main()
