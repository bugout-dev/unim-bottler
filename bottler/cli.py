import argparse

from . import core, BottlerFacet, BottlerInitializer, MockTerminus, MockErc20


def main():
    parser = argparse.ArgumentParser(
        description="dao: The command line interface to Moonstream DAO"
    )
    parser.set_defaults(func=lambda _: parser.print_help())
    dao_subparsers = parser.add_subparsers()

    core_parser = core.generate_cli()
    dao_subparsers.add_parser("core", parents=[core_parser], add_help=False)

    bottler_parser = BottlerFacet.generate_cli()
    dao_subparsers.add_parser("bottler", parents=[bottler_parser], add_help=False)

    bottler_initializer_parser = BottlerInitializer.generate_cli()
    dao_subparsers.add_parser(
        "bottler-initializer",
        parents=[bottler_initializer_parser],
        add_help=False,
    )

    terminus_parser = MockTerminus.generate_cli()
    dao_subparsers.add_parser("terminus", parents=[terminus_parser], add_help=False)

    erc20_parser = MockErc20.generate_cli()
    dao_subparsers.add_parser("erc20", parents=[erc20_parser], add_help=False)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
