- [x] Set environment variables

```bash
export TERMINUS=0x062BEc5e84289Da2CD6147E0e4DA402B33B8f796
export UNIM=0x64060aB139Feaae7f06Ca4E63189D86aDEb51691
export SENDER_KEYFILE="<path to keystore file>"
export SENDER_ADDRESS=$(jq -r  .address $SENDER_KEYFILE)
export MAX_FEE_PER_GAS="100 gwei"
export MAX_PRIORITY_FEE_PER_GAS="40 gwei"
export CONFIRMATIONS=5
export OUTFILE=./checklists/mainnet.json
export MAX_UINT256=$(python -c "print(2**256-1)")
```

- [x] Release the Kraken

```bash
bottler core release-the-kraken \
    --network matic \
    --sender $SENDER_KEYFILE  \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    -o $OUTFILE \
    --owner $SENDER_ADDRESS \
    --terminus $TERMINUS \
    --unicorn-milk $UNIM \
    --full-bottle-prices 1000000000000000000 7500000000000000000 50000000000000000000
```

- [x] Check diamond ownership
- [x] Check bottler controller
- [x] Check bottle capacities

```
$ bottler bottler get-bottle-capacities --network matic --address $BOTTLER_ADDRESS
(5000, 2000, 500)
```
- [x] Check pool volumes

```
(.bottler) neeraj@ox:~/dev/bugout-dev/unim-bottler$ bottler bottler get-volume-by-index --network matic --address $BOTTLER_ADDRESS --index 0
250000000000000000000
(.bottler) neeraj@ox:~/dev/bugout-dev/unim-bottler$ bottler bottler get-volume-by-index --network matic --address $BOTTLER_ADDRESS --index 1
2500000000000000000000
(.bottler) neeraj@ox:~/dev/bugout-dev/unim-bottler$ bottler bottler get-volume-by-index --network matic --address $BOTTLER_ADDRESS --index 2
25000000000000000000000
```

- [x] Check full bottle prices

```
$ bottler bottler get-full-bottle-prices --network matic --address $BOTTLER_ADDRESS
(1000000000000000000, 7500000000000000000, 50000000000000000000)
```

- [x] Check pool ids

```
(.bottler) neeraj@ox:~/dev/bugout-dev/unim-bottler$ bottler bottler get-full-bottle-pool-ids --network matic --address $BOTTLER_ADDRESS
(5, 6, 7)
(.bottler) neeraj@ox:~/dev/bugout-dev/unim-bottler$ bottler bottler get-empty-bottle-pool-ids --network matic --address $BOTTLER_ADDRESS
(2, 3, 4)
```

- [x] Check pool capacities

```
$ for i in {2..7}; do bottler terminus terminus-pool-capacity --network matic --address $TERMINUS --pool-id $i; done
115792089237316195423570985008687907853269984665640564039457584007913129639935
115792089237316195423570985008687907853269984665640564039457584007913129639935
115792089237316195423570985008687907853269984665640564039457584007913129639935
115792089237316195423570985008687907853269984665640564039457584007913129639935
115792089237316195423570985008687907853269984665640564039457584007913129639935
115792089237316195423570985008687907853269984665640564039457584007913129639935
```

- [x] Check pool supplies

```
$ for i in {2..7}; do bottler terminus terminus-pool-supply  --network matic --address $TERMINUS --pool-id $i; done
0
0
0
0
0
0
```

- [x] Set pool URIs

```
bottler bottler set-terminus-pool-uri \
    --network matic \
    --address $BOTTLER_ADDRESS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    --pool-id 2 \
    --uri https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/small-unim-empty.json
```

- [x] Set pool URIs

```
bottler bottler set-terminus-pool-uri \
    --network matic \
    --address $BOTTLER_ADDRESS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    --pool-id 3 \
    --uri https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/medium-unim-empty.json
```

- [x] Set pool URIs


```
bottler bottler set-terminus-pool-uri \
    --network matic \
    --address $BOTTLER_ADDRESS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    --pool-id 4 \
    --uri https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/large-unim-empty.json
```

- [x] Set pool URIs


```
bottler bottler set-terminus-pool-uri \
    --network matic \
    --address $BOTTLER_ADDRESS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    --pool-id 5 \
    --uri https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/small-unim-full.json
```

- [x] Set pool URIs


```
bottler bottler set-terminus-pool-uri \
    --network matic \
    --address $BOTTLER_ADDRESS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    --pool-id 6 \
    --uri https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/medium-unim-full.json
```

- [x] Set pool URIs


```
bottler bottler set-terminus-pool-uri \
    --network matic \
    --address $BOTTLER_ADDRESS \
    --sender $SENDER_KEYFILE \
    --max-fee-per-gas "$MAX_FEE_PER_GAS" \
    --max-priority-fee-per-gas "$MAX_PRIORITY_FEE_PER_GAS" \
    --confirmations $CONFIRMATIONS \
    --pool-id 7 \
    --uri https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/large-unim-full.json

```

- [ ] Test on mainnet
- [ ] verify contracts
- [ ] MARKETING
