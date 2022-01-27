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

```bash
bottler core gogogo \
    --sender $SENDER_KEYFILE \
    --owner $SENDER_ADDRESS \
    --network $POLYGON_NETWORK \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    -o $OUTFILE

```

`export BOTTLER_DIAMOND=<Diamond_address_of_bottler>`

```bash
bottler bottler set-up \
    --network $POLYGON_NETWORK \
    --address $BOTTLER_DIAMOND \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    --unim-address-arg $UNIM \
    --terminus-address-arg $TERMINUS 

```




Verify Unim address:`bottler bottler get-unim-address --network $POLYGON_NETWORK --address $BOTTLER_DIAMOND`

Verify Terminus address: `bottler bottler get-terminus-address --network $POLYGON_NETWORK --address $BOTTLER_DIAMOND`

export Terminus payment token `export TERMINUS_PAYMENT_TOKEN=$MNSTR_DAO`


Approve terminus payment token :
```
bottler erc20 approve \
    --network $POLYGON_NETWORK \
    --address $TERMINUS_PAYMENT_TOKEN \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    --spender $TERMINUS \
    --amount $MAX_UINT256

```


Create terminus pools:
```
bottler terminus create-pool-v1 \
    --network $POLYGON_NETWORK \
    --address $TERMINUS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --capacity-arg $MAX_UINT256 \
    --transferable-arg true \
    --burnable-arg true

bottler terminus create-pool-v1 \
    --network $POLYGON_NETWORK \
    --address $TERMINUS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --capacity-arg $MAX_UINT256 \
    --transferable-arg true \
    --burnable-arg true

bottler terminus create-pool-v1 \
    --network $POLYGON_NETWORK \
    --address $TERMINUS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --capacity-arg $MAX_UINT256 \
    --transferable-arg true \
    --burnable-arg true

bottler terminus create-pool-v1 \
    --network $POLYGON_NETWORK \
    --address $TERMINUS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --capacity-arg $MAX_UINT256 \
    --transferable-arg true \
    --burnable-arg true

bottler terminus create-pool-v1 \
    --network $POLYGON_NETWORK \
    --address $TERMINUS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --capacity-arg $MAX_UINT256 \
    --transferable-arg true \
    --burnable-arg true

bottler terminus create-pool-v1 \
    --network $POLYGON_NETWORK \
    --address $TERMINUS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --capacity-arg $MAX_UINT256 \
    --transferable-arg true \
    --burnable-arg true

```

Attach empty bottle pool ids in bottler contract
```
bottler bottler set-empty-bottle-pool-ids \
    --network $POLYGON_NETWORK \
    --address $BOTTLER_DIAMOND \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --new-empty-bottle-pool-ids 33 34 35

```

Attach full bottle pool ids in bottler contract
```
bottler bottler set-full-bottle-pool-ids \
    --network $POLYGON_NETWORK \
    --address $BOTTLER_DIAMOND \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --new-full-bottle-pool-ids 36 37 38

```


Giving pools control to Bottler contract
```
for i in {33..38} 
do
    bottler terminus set-pool-controller \
        --network $POLYGON_NETWORK \
        --address $TERMINUS \
        --sender $SENDER_KEYFILE \
        --max-fee-per-gas "$MAX_FEE_PER_GAS" \
        --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
        --pool-id $i --new-controller $BOTTLER_DIAMOND 
done
```

Setting bottles capacities
##haven't run yet:
```
 bottler bottler set-bottle-capacities \
        --network $POLYGON_NETWORK \
        --address $BOTTLER_DIAMOND \
        --sender $SENDER_KEYFILE \
        --max-fee-per-gas "$MAX_FEE_PER_GAS" \
        --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
        --new-bottle-capacities  
```










