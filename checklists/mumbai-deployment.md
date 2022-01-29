## Constants - TESTNET

-   `MNSTR_DAO` - Testnet Moonstream DAO contract address
-   `TERMINUS` - Testnet Terminus contract address
-   `UNIM` - Testnet Unicorn milk contract
-   `POLYGON_NETWORK` - Testnet brownie network name
-   `SENDER_ADDRESS` - Testnet account owner address
-   `SENDER_KEYFILE` - Testnet account owner keyfile

```
export MNSTR_DAO=0x02620263be8A046Ca4812723596934AA20D7DC3C
export TERMINUS=0x040Cf7Ee9752936d8d280062a447eB53808EBc08
export UNIM=0x3655B1500122aE4A0f1ADB85D6581F0127e63814
export POLYGON_NETWORK="polygon-test"
export SENDER_KEYFILE=".secrets/dev.json"
export SENDER_ADDRESS=$(jq -r  .address $SENDER_KEYFILE)
export MAX_FEE_PER_GAS="1000 gwei"
export MAX_PRIORITY_FEE_PER_GAS="40 gwei"
export CONFIRMATIONS=1
export OUTFILE=.secrets/bottlerMumbai.json
export MAX_UINT256=$(python -c "print(2**256-1)")
```



## Deployment
```
bottler core release-the-kraken --network polygon-test --sender $SENDER_KEYFILE  --owner $SENDER_ADDRESS --terminus $TERMINUS --unicorn-milk $UNIM --full-bottle-prices 1 4 24 --gas-price "100 gwei"
```



```
{
    "gogogo": {
        "DiamondCutFacet": "0x7C6736683A545d5c1BC6495F3FB39A0b491d403f",
        "Diamond": "0x5411aed2C143B3cdAD84c5BfeC908F9AF136B97D",
        "DiamondLoupeFacet": "0xAa0e66C3C591411fD5A0f7A021ed6830f316F6d6",
        "OwnershipFacet": "0x97b24031e0d61370Df3B9a21F1e7b4763FB6feA4",
        "BottlerInitializer": "0x0BBB49B534fc2D89Fba17BDa6Bb32A2C0A7D2a5F",
        "BottlerFacet": "0x46d31AFE335572BBC3EaEe084330510DCd1039d0",
        "attached": [
            "DiamondLoupeFacet",
            "OwnershipFacet",
            "BottlerFacet"
        ]
    },
    "pools": {
        "empty": [
            69,
            70,
            71
        ],
        "full": [
            72,
            73,
            74
        ]
    }
```





