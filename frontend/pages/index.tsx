import React, { useContext } from "react";
import {
  Stack,
  Heading,
  Center,
  Flex,
  Badge,
  Image,
  Text,
  Spacer,
} from "@chakra-ui/react";
import { DEFAULT_METATAGS } from "../src/core/constants";
import { UNIM_ADDRESS, BOTTLER_ADDRESS } from "../src/AppDefintions";

import useBottler, { BOTTLE_TYPES } from "../src/core/hooks/useBottler";
import { targetChain } from "../src/core/providers/Web3Provider";

import UIContext from "../src/core/providers/UIProvider/context";
import BottleCard from "../src/components/BottleCard";
import InventoryItem from "../src/components/InventoryItem";

const assets: any = {
  smallBottleImage: BOTTLE_TYPES.small.imageUrl,
  mediumBottleImage: BOTTLE_TYPES.medium.imageUrl,
  largeBottleImage: BOTTLE_TYPES.large.imageUrl,
};

const Homepage = () => {
  const ui = useContext(UIContext);
  const bottler = useBottler({
    MilkAddress: UNIM_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain: targetChain,
  });

  return (
    <>
      <Center w="100%" bgColor="blue.1200">
        <Flex
          w="100%"
          maxW="1800px"
          minH="100vh"
          direction="row"
          placeContent="center"
          p={4}
          flexWrap={"wrap"}
        >
          {/* <Heading>Your account UNIM tokens: {bottler.erc20Balance} </Heading> */}
          <Stack
            maxW="800px"
            px={4}
            bgColor={"purple.200"}
            h={ui.isMobileView ? "auto" : "600px"}
            w="100%"
            placeSelf={"center"}
            borderRadius="lg"
            boxShadow="xl"
            mx={2}
          >
            <Heading>You bring the UNIM, we bring the bottles</Heading>
            <Flex
              direction={"row"}
              flexWrap={ui.isMobileView ? "wrap" : "nowrap"}
              justifyContent={ui.isMobileView ? "center" : "space-evenly"}
              spacing={ui.isMobileView ? 0 : "inherit"}
              alignItems={"baseline"}
            >
              <BottleCard
                bottle={BOTTLE_TYPES.small}
                isDisabled={
                  Number(bottler.erc20Balance) <
                    bottler.bottleVolumes[BOTTLE_TYPES.small.poolId] ||
                  Number(bottler.erc20Balance) === 0
                }
                volume={bottler.bottleVolumes[BOTTLE_TYPES.small.poolId]}
                bottlesLeft={Number(
                  bottler.bottlesLeftToMint[BOTTLE_TYPES.small.poolId]
                )}
                fullBottlePrice={Number(bottler.fullBottlesPrices[BOTTLE_TYPES.small.poolId])}
              />
              <BottleCard
                bottle={BOTTLE_TYPES.medium}
                isDisabled={
                  Number(bottler.erc20Balance) <
                    bottler.bottleVolumes[BOTTLE_TYPES.medium.poolId] ||
                  Number(bottler.erc20Balance) === 0
                }
                volume={bottler.bottleVolumes[BOTTLE_TYPES.medium.poolId]}
                bottlesLeft={Number(
                  bottler.bottlesLeftToMint[BOTTLE_TYPES.medium.poolId]
                )}
                fullBottlePrice={Number(bottler.fullBottlesPrices[BOTTLE_TYPES.medium.poolId])}
              />
              <BottleCard
                bottle={BOTTLE_TYPES.large}
                isDisabled={
                  Number(bottler.erc20Balance) <
                    bottler.bottleVolumes[BOTTLE_TYPES.large.poolId] ||
                  Number(bottler.erc20Balance) === 0
                }
                volume={bottler.bottleVolumes[BOTTLE_TYPES.large.poolId]}
                bottlesLeft={Number(
                  bottler.bottlesLeftToMint[BOTTLE_TYPES.large.poolId]
                )}
                fullBottlePrice={Number(bottler.fullBottlesPrices[BOTTLE_TYPES.large.poolId])}
              />
            </Flex>
          </Stack>
          <Stack
            mx={2}
            maxW="800px"
            px={4}
            bgColor={"purple.200"}
            h={ui.isMobileView ? "inherit" : "600px"}
            w="100%"
            placeSelf={"center"}
            borderRadius="lg"
            boxShadow="xl"
            pb={ui.isMobileView ? "100px" : "inherit"}
          >
            <Stack direction={["column", "row", null]}>
              <Heading fontWeight={900}>My inventory</Heading>
              <Spacer />
              <Badge
                colorScheme={"pink"}
                variant={"solid"}
                fontSize={"md"}
                borderRadius={"md"}
                wordBreak={"break-word"}
                whiteSpace={"normal"}
                textAlign={"center"}
                alignSelf={"center"}
                // maxW="200px"
                // ml={4}
                // mt={2}
              >
                <Flex>
                  <Image
                    ml={2}
                    h="22px"
                    src="https://darkforest.cryptounicorns.fun/static/media/icon_milk.6fc3d44e.png"
                  />
                  <Text mx={2} display={"inline-block"}>
                    {bottler.erc20Balance}
                  </Text>
                </Flex>
              </Badge>
            </Stack>
            <Stack direction={"column"} justifyContent={"space-evenly"}>
              <InventoryItem
                item={BOTTLE_TYPES.small}
                isFull={true}
                qty={bottler.fullBottles[0]}
              />
              <InventoryItem
                item={BOTTLE_TYPES.medium}
                isFull={true}
                qty={bottler.fullBottles[1]}
              />
              <InventoryItem
                item={BOTTLE_TYPES.large}
                isFull={true}
                qty={bottler.fullBottles[2]}
              />
              <InventoryItem
                item={BOTTLE_TYPES.small}
                isFull={false}
                qty={bottler.emptyBottles[0]}
              />
              <InventoryItem
                item={BOTTLE_TYPES.medium}
                isFull={false}
                qty={bottler.emptyBottles[1]}
              />
              <InventoryItem
                item={BOTTLE_TYPES.large}
                isFull={false}
                qty={bottler.emptyBottles[2]}
              />
            </Stack>
          </Stack>
        </Flex>
      </Center>
      <Stack />
    </>
  );
};

interface Preconnect {
  rel: string;
  href: string;
  as?: string;
}

export async function getStaticProps() {
  const assetPreload: Array<Preconnect> = assets
    ? Object.keys(assets).map((key) => {
        return {
          rel: "preload",
          href: assets[key],
          as: "image",
        };
      })
    : [];
  const preconnects: Array<Preconnect> = [
    { rel: "preconnect", href: "https://s3.amazonaws.com" },
  ];

  const preloads = assetPreload.concat(preconnects);

  return {
    props: { metaTags: DEFAULT_METATAGS, preloads },
  };
}

export default Homepage;
