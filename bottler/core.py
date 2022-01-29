"""
Generic diamond functionality for Moonstream contracts.
"""

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional, Set

from brownie import network
from bottler.MockErc20 import MockErc20

from bottler.MockTerminus import MockTerminus

from . import (
    abi,
    Diamond,
    DiamondCutFacet,
    DiamondLoupeFacet,
    BottlerFacet,
    BottlerInitializer,
    OwnershipFacet,
)

FACETS: Dict[str, Any] = {
    "DiamondCutFacet": DiamondCutFacet,
    "DiamondLoupeFacet": DiamondLoupeFacet,
    "OwnershipFacet": OwnershipFacet,
    "BottlerFacet": BottlerFacet,
}

FACET_PRECEDENCE: List[str] = [
    "DiamondCutFacet",
    "OwnershipFacet",
    "DiamondLoupeFacet",
    "BottlerFacet",
]

FACET_ACTIONS: Dict[str, int] = {"add": 0, "replace": 1, "remove": 2}

ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


def facet_cut(
    diamond_address: str,
    facet_name: str,
    facet_address: str,
    action: str,
    transaction_config: Dict[str, Any],
    initializer_address: str = ZERO_ADDRESS,
    ignore_methods: Optional[List[str]] = None,
    ignore_selectors: Optional[List[str]] = None,
) -> Any:
    """
    Cuts the given facet onto the given Diamond contract.

    Resolves selectors in the precedence order defined by FACET_PRECEDENCE (highest precedence first).
    """
    assert (
        facet_name in FACETS
    ), f"Invalid facet: {facet_name}. Choices: {','.join(FACETS)}."

    assert (
        action in FACET_ACTIONS
    ), f"Invalid cut action: {action}. Choices: {','.join(FACET_ACTIONS)}."

    if ignore_methods is None:
        ignore_methods = []
    if ignore_selectors is None:
        ignore_selectors = []

    project_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    abis = abi.project_abis(project_dir)

    reserved_selectors: Set[str] = set()
    for facet in FACET_PRECEDENCE:
        if facet == facet_name:
            break

        facet_abi = abis.get(facet, [])
        for item in facet_abi:
            if item["type"] == "function":
                reserved_selectors.add(abi.encode_function_signature(item))

    facet_function_selectors: List[str] = []
    facet_abi = abis.get(facet_name, [])
    for item in facet_abi:
        if item["type"] == "function":
            if item["name"] not in ignore_methods:
                function_selector = abi.encode_function_signature(item)
                if (
                    function_selector not in reserved_selectors
                    and function_selector not in ignore_selectors
                ):
                    facet_function_selectors.append(function_selector)

    target_address = facet_address
    if FACET_ACTIONS[action] == 2:
        target_address = ZERO_ADDRESS

    diamond_cut_action = [
        target_address,
        FACET_ACTIONS[action],
        facet_function_selectors,
    ]

    calldata = b""
    if facet_name == "BottlerFacet":
        if initializer_address != ZERO_ADDRESS and action != "remove":
            bottler_initializer = BottlerInitializer.BottlerInitializer(
                initializer_address
            )
            calldata = bottler_initializer.contract.init.encode_input()

    diamond = DiamondCutFacet.DiamondCutFacet(diamond_address)
    transaction = diamond.diamond_cut(
        [diamond_cut_action], initializer_address, calldata, transaction_config
    )
    return transaction


def gogogo(owner_address: str, transaction_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deploy diamond along with all its basic facets and attach those facets to the diamond.

    Returns addresses of all the deployed contracts with the contract names as keys.
    """
    result: Dict[str, Any] = {}

    try:
        diamond_cut_facet = DiamondCutFacet.DiamondCutFacet(None)
        diamond_cut_facet.deploy(transaction_config)
    except Exception as e:
        print(e)
        result["error"] = "Failed to deploy DiamondCutFacet"
        return result
    result["DiamondCutFacet"] = diamond_cut_facet.address

    try:
        diamond = Diamond.Diamond(None)
        diamond.deploy(owner_address, diamond_cut_facet.address, transaction_config)
    except Exception as e:
        print(e)
        result["error"] = "Failed to deploy Diamond"
        return result
    result["Diamond"] = diamond.address

    try:
        diamond_loupe_facet = DiamondLoupeFacet.DiamondLoupeFacet(None)
        diamond_loupe_facet.deploy(transaction_config)
    except Exception as e:
        print(e)
        result["error"] = "Failed to deploy DiamondLoupeFacet"
        return result
    result["DiamondLoupeFacet"] = diamond_loupe_facet.address

    try:
        ownership_facet = OwnershipFacet.OwnershipFacet(None)
        ownership_facet.deploy(transaction_config)
    except Exception as e:
        print(e)
        result["error"] = "Failed to deploy OwnershipFacet"
        return result
    result["OwnershipFacet"] = ownership_facet.address

    try:
        bottler_initializer = BottlerInitializer.BottlerInitializer(None)
        bottler_initializer.deploy(transaction_config)
    except Exception as e:
        print(e)
        result["error"] = "Failed to deploy BottlerInitializer"
        return result
    result["BottlerInitializer"] = bottler_initializer.address

    try:
        bottler_facet = BottlerFacet.BottlerFacet(None)
        bottler_facet.deploy(transaction_config)
    except Exception as e:
        print(e)
        result["error"] = "Failed to deploy BottlerFacet"
        return result
    result["BottlerFacet"] = bottler_facet.address

    result["attached"] = []

    try:
        facet_cut(
            diamond.address,
            "DiamondLoupeFacet",
            diamond_loupe_facet.address,
            "add",
            transaction_config,
        )
    except Exception as e:
        print(e)
        result["error"] = "Failed to attach DiamondLoupeFacet"
        return result
    result["attached"].append("DiamondLoupeFacet")

    try:
        facet_cut(
            diamond.address,
            "OwnershipFacet",
            ownership_facet.address,
            "add",
            transaction_config,
        )
    except Exception as e:
        print(e)
        result["error"] = "Failed to attach OwnershipFacet"
        return result
    result["attached"].append("OwnershipFacet")

    try:
        facet_cut(
            diamond.address,
            "BottlerFacet",
            bottler_facet.address,
            "add",
            transaction_config,
            initializer_address=bottler_initializer.address,
        )
    except Exception as e:
        print(e)
        result["error"] = "Failed to attach BottlerFacet"
        return result
    result["attached"].append("BottlerFacet")

    return result


def release_the_kraken(
    owner_address: str,
    terminus_address: str,
    unicorn_milk_address: str,
    raw_full_bottle_prices: List[int],
    transaction_config: Dict[str, Any],
) -> Dict[str, Any]:

    result: Dict[str, Any] = {}
    terminus = MockTerminus(terminus_address)
    terminus_payment_token_address = terminus.payment_token()
    terminus_payment_token = MockErc20(terminus_payment_token_address)

    print("Checking if you have enough terminus payment tokens")
    balance = terminus_payment_token.balance_of(owner_address)
    print("Your terminus payment token balance is:", balance)
    if balance < terminus.pool_base_price() * 6:
        raise Exception("You don't have enough tokens to pay for the pools")

    print("Running gogogo")
    gogogo_result = gogogo(owner_address, transaction_config)
    if "error" in gogogo_result:
        print(gogogo_result)
        print("Do you want to continue anyway? (y/n)")
        if input() != "y":
            raise Exception(gogogo_result["error"])

    result["gogogo"] = gogogo_result
    bottler = BottlerFacet.BottlerFacet(result["gogogo"]["Diamond"])

    print("Creating terminus pools:")
    current_id = terminus.total_pools() + 1

    print("Approving the payment token for terminus")
    terminus_payment_token.approve(terminus.address, 2 ** 256 - 1, transaction_config)

    print("Creating pools:")
    for i in range(1, 7):
        terminus.create_pool_v1(2 ** 256 - 1, True, True, transaction_config)

    result["pools"] = {
        "empty": [current_id, current_id + 1, current_id + 2],
        "full": [current_id + 3, current_id + 4, current_id + 5],
    }

    print("Transferring pools control to the bottler contract")
    for pool_id in result["pools"]["empty"]:
        terminus.set_pool_controller(
            pool_id,
            bottler.address,
            transaction_config,
        )

    for pool_id in result["pools"]["full"]:
        terminus.set_pool_controller(
            pool_id,
            bottler.address,
            transaction_config,
        )

    bottler.set_up(unicorn_milk_address, terminus_address, transaction_config)
    bottler.set_bottle_capacities([5000, 1000, 500], transaction_config)

    bottler.set_empty_bottle_pool_ids(result["pools"]["empty"], transaction_config)
    bottler.set_full_bottle_pool_ids(result["pools"]["full"], transaction_config)

    full_bottle_prices = raw_full_bottle_prices
    bottler.set_full_bottle_prices(full_bottle_prices, transaction_config)
    return result


def handle_facet_cut(args: argparse.Namespace) -> None:
    network.connect(args.network)
    diamond_address = args.address
    action = args.action
    facet_name = args.facet_name
    facet_address = args.facet_address
    transaction_config = Diamond.get_transaction_config(args)
    facet_cut(
        diamond_address,
        facet_name,
        facet_address,
        action,
        transaction_config,
        initializer_address=args.initializer_address,
        ignore_methods=args.ignore_methods,
        ignore_selectors=args.ignore_selectors,
    )


def handle_gogogo(args: argparse.Namespace) -> None:
    network.connect(args.network)
    owner_address = args.owner
    transaction_config = Diamond.get_transaction_config(args)
    result = gogogo(owner_address, transaction_config)
    if args.outfile is not None:
        with args.outfile:
            json.dump(result, args.outfile)
    json.dump(result, sys.stdout, indent=4)


def handle_release_the_kraken(args: argparse.Namespace) -> None:
    network.connect(args.network)
    owner_address = args.owner

    transaction_config = Diamond.get_transaction_config(args)
    result = release_the_kraken(
        owner_address,
        args.terminus,
        args.unicorn_milk,
        args.full_bottle_prices,
        transaction_config,
    )

    if args.outfile is not None:
        with args.outfile:
            json.dump(result, args.outfile)
    json.dump(result, sys.stdout, indent=4)


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="CLI to manage Moonstream DAO diamond contracts",
    )
    parser.set_defaults(func=lambda _: parser.print_help())
    subcommands = parser.add_subparsers()

    Diamond_parser = Diamond.generate_cli()
    subcommands.add_parser("diamond", parents=[Diamond_parser], add_help=False)

    facet_cut_parser = subcommands.add_parser("facet-cut")
    Diamond.add_default_arguments(facet_cut_parser, transact=True)
    facet_cut_parser.add_argument(
        "--facet-name",
        required=True,
        choices=FACETS,
        help="Name of facet to cut into or out of diamond",
    )
    facet_cut_parser.add_argument(
        "--facet-address",
        required=False,
        default=ZERO_ADDRESS,
        help=f"Address of deployed facet (default: {ZERO_ADDRESS})",
    )
    facet_cut_parser.add_argument(
        "--action",
        required=True,
        choices=FACET_ACTIONS,
        help="Diamond cut action to take on entire facet",
    )
    facet_cut_parser.add_argument(
        "--initializer-address",
        default=ZERO_ADDRESS,
        help=f"Address of contract to run as initializer after cut (default: {ZERO_ADDRESS})",
    )
    facet_cut_parser.add_argument(
        "--ignore-methods",
        nargs="+",
        help="Names of methods to ignore when cutting a facet onto or off of the diamond",
    )
    facet_cut_parser.add_argument(
        "--ignore-selectors",
        nargs="+",
        help="Method selectors to ignore when cutting a facet onto or off of the diamond",
    )
    facet_cut_parser.set_defaults(func=handle_facet_cut)

    gogogo_parser = subcommands.add_parser("gogogo")
    Diamond.add_default_arguments(gogogo_parser, transact=True)
    gogogo_parser.add_argument(
        "--owner", required=True, help="Address of owner of diamond proxy"
    )
    gogogo_parser.add_argument(
        "-o",
        "--outfile",
        type=argparse.FileType("w"),
        default=None,
        help="(Optional) file to write deployed addresses to",
    )
    gogogo_parser.set_defaults(func=handle_gogogo)

    DiamondCutFacet_parser = DiamondCutFacet.generate_cli()
    subcommands.add_parser(
        "diamond-cut", parents=[DiamondCutFacet_parser], add_help=False
    )

    DiamondLoupeFacet_parser = DiamondLoupeFacet.generate_cli()
    subcommands.add_parser(
        "diamond-loupe", parents=[DiamondLoupeFacet_parser], add_help=False
    )

    OwnershipFacet_parser = OwnershipFacet.generate_cli()
    subcommands.add_parser("ownership", parents=[OwnershipFacet_parser], add_help=False)

    release_the_kraken_parser = subcommands.add_parser("release-the-kraken")
    Diamond.add_default_arguments(release_the_kraken_parser, transact=True)
    release_the_kraken_parser.add_argument(
        "--owner", required=True, help="Address of owner of diamond proxy"
    )
    release_the_kraken_parser.add_argument(
        "-o",
        "--outfile",
        type=argparse.FileType("w"),
        default=None,
        help="(Optional) file to write deployed addresses to",
    )
    release_the_kraken_parser.add_argument(
        "--terminus",
        required=True,
        help="Address of terminus contract",
    )
    release_the_kraken_parser.add_argument(
        "--unicorn-milk",
        required=True,
        help="Address of unicorn milk contract",
    )
    release_the_kraken_parser.add_argument(
        "--full-bottle-prices",
        nargs="+",
        type=int,
        required=True,
        help="Full bottle prices",
    )

    release_the_kraken_parser.set_defaults(func=handle_release_the_kraken)

    return parser


def main() -> None:
    parser = generate_cli()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
