import React, { useContext } from "react";
import { Stack, Heading, Center, Flex } from "@chakra-ui/react";
import { DEFAULT_METATAGS } from "../src/core/constants";
import { MILK_ADDRESS, BOTTLER_ADDRESS } from "../src/AppDefintions";
const assets = undefined;
import useBottler, { BOTTLE_TYPES } from "../src/core/hooks/useBottler";
import { targetChain } from "../src/core/providers/Web3Provider";

import UIContext from "../src/core/providers/UIProvider/context";
import BottleCard from "../src/components/BottleCard";
import InventoryItem from "../src/components/InventoryItem";

const Homepage = () => {
  const ui = useContext(UIContext);
  const bottler = useBottler({
    MilkAddress: MILK_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain: targetChain,
  });

  console.log("test", Number(bottler.erc20Balance) < BOTTLE_TYPES.small.volume);
  return (
    <>
      <Center w="100%" bgColor="blue.900">
        <Stack
          w="100%"
          maxW="1337px"
          minH="100vh"
          direction="column"
          placeContent="center"
          p={4}
          spacing={8}
        >
          <Heading>Your account UNIM tokens: {bottler.erc20Balance} </Heading>
          <Stack
            maxW="1024px"
            px={4}
            bgColor={"purple.200"}
            h={ui.isMobileView ? "auto" : "600px"}
            w="100%"
            placeSelf={"center"}
            borderRadius="lg"
            boxShadow="xl"
          >
            <Heading>Fill your milk in to bottles</Heading>
            <Flex
              direction={"row"}
              flexWrap={ui.isMobileView ? "wrap" : "nowrap"}
              justifyContent={ui.isMobileView ? "center" : "space-evenly"}
              spacing={ui.isMobileView ? 0 : "inherit"}
              alignItems={"baseline"}
            >
              <BottleCard
                bottle={BOTTLE_TYPES.medium}
                isDisabled={
                  Number(bottler.erc20Balance) < BOTTLE_TYPES.small.volume
                }
              />
              <BottleCard
                bottle={BOTTLE_TYPES.medium}
                isDisabled={
                  Number(bottler.erc20Balance) < BOTTLE_TYPES.medium.volume
                }
              />
              <BottleCard
                bottle={BOTTLE_TYPES.large}
                isDisabled={
                  Number(bottler.erc20Balance) < BOTTLE_TYPES.large.volume
                }
              />
            </Flex>
          </Stack>
          <Stack
            maxW="1024px"
            px={4}
            bgColor={"purple.200"}
            h={ui.isMobileView ? "inherit" : "600px"}
            w="100%"
            placeSelf={"center"}
            borderRadius="lg"
            boxShadow="xl"
            pb={ui.isMobileView ? "100px" : "inherit"}
          >
            <Heading>My inventory</Heading>
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
                item={BOTTLE_TYPES.small}
                isFull={false}
                qty={bottler.emptyBottles[1]}
              />
              <InventoryItem
                item={BOTTLE_TYPES.small}
                isFull={false}
                qty={bottler.emptyBottles[2]}
              />
            </Stack>
          </Stack>
        </Stack>
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
