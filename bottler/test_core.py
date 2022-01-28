import unittest

from brownie import accounts, network

from .core import facet_cut, gogogo
from . import BottlerFacet
from . import BottlerInitializer


class BottlerSingleContractTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        print(accounts._accounts)
        try:
            network.connect()
        except:
            pass
        cls.contracts = gogogo(accounts[0], {"from": accounts[0]})


class BottlerTestCase(BottlerSingleContractTestCase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()

        # Deploy Bottler
        initializer = BottlerInitializer.BottlerInitializer(None)
        initializer.deploy({"from": accounts[0]})

        bottler_facet = BottlerFacet.BottlerFacet(None)
        bottler_facet.deploy({"from": accounts[0]})

        diamond_address = cls.contracts["Diamond"]
        facet_cut(
            diamond_address,
            "BottlerFacet",
            bottler_facet.address,
            "add",
            {"from": accounts[0]},
            initializer.address,
        )

        cls.bottler_initializer = initializer.address
        cls.bottler_facet = bottler_facet.address


class TestCoreDeployment(BottlerSingleContractTestCase):
    def test_gogogo(self):
        self.assertIn("DiamondCutFacet", self.contracts)
        self.assertIn("Diamond", self.contracts)
        self.assertIn("DiamondLoupeFacet", self.contracts)
        self.assertIn("OwnershipFacet", self.contracts)
        self.assertIn("attached", self.contracts)

        self.assertListEqual(
            self.contracts["attached"],
            ["DiamondLoupeFacet", "OwnershipFacet", "BottlerFacet"],
        )


if __name__ == "__main__":
    unittest.main()
