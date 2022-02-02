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
  Spinner,
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
  smallEmptyBottleImage: BOTTLE_TYPES.small.emptyImageURL,
  mediumEmptyBottleImage: BOTTLE_TYPES.medium.emptyImageURL,
  largeEmptyBottleImage: BOTTLE_TYPES.large.emptyImageURL,
};

const Homepage = () => {
  const ui = useContext(UIContext);
  const bottler = useBottler({
    MilkAddress: UNIM_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain: targetChain,
  });

  const isCardDisabled = (bottlePoolId: number): boolean => {
    if (bottler.bottleVolumesCache.isLoading) return true;
    console.debug("pass: 1", bottler.bottleVolumesCache.data);
    if (!bottler.bottleVolumesCache.data) return true;
    console.debug("pass: 2");
    if (bottler.balanceCache.isLoading) return true;
    console.debug("pass: 3");
    if (!bottler.balanceCache.data) return true;
    console.debug("pass: 4");
    if (!bottler.bottleVolumesCache.data[bottlePoolId]) return true;
    console.debug("pass: 5");
    if (
      Number(bottler.balanceCache.data) <
      bottler.bottleVolumesCache.data[bottlePoolId].matic
    )
      return true;
    console.debug("pass: 6");
    if (Number(bottler.balanceCache.data) === 0) return true;
    else return false;
  };

  console.debug("bottler.bottlesLeftCache.data", bottler.bottlesLeftCache.data);

  return (
    <>
      <Center w="100%" bgColor="blue.1200">
        <Flex
          w="100%"
          maxW="1800px"
          minH="75vh"
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
                isDisabled={isCardDisabled(BOTTLE_TYPES.small.poolId)}
              />
              <BottleCard
                bottle={BOTTLE_TYPES.medium}
                isDisabled={isCardDisabled(BOTTLE_TYPES.medium.poolId)}
              />
              <BottleCard
                bottle={BOTTLE_TYPES.large}
                isDisabled={isCardDisabled(BOTTLE_TYPES.large.poolId)}
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
                    {bottler.balanceCache.isLoading ? (
                      <Spinner />
                    ) : (
                      bottler.balanceCache.data
                    )}
                  </Text>
                </Flex>
              </Badge>
            </Stack>
            <Stack direction={"column"} justifyContent={"space-evenly"}>
              <InventoryItem
                item={BOTTLE_TYPES.small}
                isFull={true}
                qty={
                  bottler.fullBottlesCache.data
                    ? bottler.fullBottlesCache.data[0]
                    : 0
                }
              />
              <InventoryItem
                item={BOTTLE_TYPES.medium}
                isFull={true}
                qty={
                  bottler.fullBottlesCache.data
                    ? bottler.fullBottlesCache.data[1]
                    : 0
                }
              />
              <InventoryItem
                item={BOTTLE_TYPES.large}
                isFull={true}
                qty={
                  bottler.fullBottlesCache.data
                    ? bottler.fullBottlesCache.data[2]
                    : 0
                }
              />
              <InventoryItem
                item={BOTTLE_TYPES.small}
                isFull={false}
                qty={
                  bottler.emptyBottlesCache.data
                    ? bottler.emptyBottlesCache.data[0]
                    : 0
                }
              />
              <InventoryItem
                item={BOTTLE_TYPES.medium}
                isFull={false}
                qty={
                  bottler.emptyBottlesCache.data
                    ? bottler.emptyBottlesCache.data[1]
                    : 0
                }
              />
              <InventoryItem
                item={BOTTLE_TYPES.large}
                isFull={false}
                qty={
                  bottler.emptyBottlesCache.data
                    ? bottler.emptyBottlesCache.data[1]
                    : 0
                }
              />
            </Stack>
          </Stack>
        </Flex>
      </Center>
      <Center w="100%" bgColor="blue.1200">
        <Image
          ml={2}
          src="https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/unim-onboarding.png"
        />
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
