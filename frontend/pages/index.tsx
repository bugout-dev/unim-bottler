import React, { useContext } from "react";
import {
  Stack,
  Heading,
  Button,
  Center,
  Box,
  Image,
  chakra,
  Text,
  Spacer,
  Flex,
} from "@chakra-ui/react";
import { DEFAULT_METATAGS } from "../src/core/constants";
import { MILK_ADDRESS, BOTTLER_ADDRESS } from "../src/AppDefintions";
const assets = undefined;
import { MODAL_TYPES } from "../src/core/providers/OverlayProvider/constants";
import overlayContext from "../src/core/providers/OverlayProvider/context";
import useBottler, { BOTTLE_TYPES } from "../src/core/hooks/useBottler";
import { targetChain } from "../src/core/providers/Web3Provider";
import { BottleType } from "../src/core/hooks/useBottler";
import RouteButton from "../src/components/RouteButton";
import UIContext from "../src/core/providers/UIProvider/context";

const Homepage = () => {
  const overlay = useContext(overlayContext);
  const ui = useContext(UIContext);
  const bottler = useBottler({
    MilkAddress: MILK_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain: targetChain,
  });

  const handleCardClick = (bottle: BottleType) => {
    console.log(bottle.name);
    overlay.toggleModal({
      type: MODAL_TYPES.FILL_BOTTLE,
      props: { bottle: bottle },
    });
  };

  const handlePourClick = ({
    item,
    qty,
  }: {
    item: BottleType;
    qty?: number;
  }) => {
    overlay.toggleModal({
      type: MODAL_TYPES.POUR_BOTTLE,
      props: { bottle: item, qty: qty },
    });
  };

  const handleRefillClick = ({ item }: { item: BottleType }) => {
    overlay.toggleModal({
      type: MODAL_TYPES.FILL_BOTTLE,
      props: { bottle: item },
    });
  };

  const BottleCard = ({
    bottle,
    isDisabled,
  }: {
    bottle: BottleType;
    isDisabled: boolean;
  }) => {
    return (
      <Box
        onClick={isDisabled ? undefined : () => handleCardClick(bottle)}
        borderRadius="xl"
        boxShadow={"lg"}
        w="240px"
        h="360px"
        bgColor="purple.900"
        backgroundBlendMode={"darken"}
        transition="0.2s"
        _hover={{ transform: "scale(1.05)", transition: "0.1s" }}
        position={"relative"}
        my={4}
        mx={4}
      >
        <Box
          borderRadius={"xl"}
          position="relative"
          top="0"
          left="0"
          h="360px"
          w="240px"
          backgroundColor={isDisabled ? "rgba(128,128,128,1)" : "inherit"}
        >
          {isDisabled && (
            <Heading
              textColor={"gray.300"}
              w="100%"
              transform="rotate(45deg)"
              position={"absolute"}
              zIndex={100}
              top="20%"
              right="-15%"
              fontSize="49px"
            >
              Not enough milk
            </Heading>
          )}
          <Image
            borderRadius="49px"
            h="280px"
            w="280px"
            // bgColor="red"
            src={bottle.imageUrl}
            filter={isDisabled ? "brightness(30%)" : "inherit"}
          />
          <Stack pt={4} align={"center"}>
            <Text
              color={"gray.500"}
              fontSize={"sm"}
              textTransform={"uppercase"}
            >
              {bottle.name} bottle
            </Text>

            <Stack direction={"row"} align={"center"}>
              <Text fontWeight={800} fontSize={"xl"}>
                ({bottle.volume} UNIM)
              </Text>
            </Stack>
          </Stack>
          <chakra.span
            alignSelf={"center"}
            h="80px"
            placeSelf={"center"}
            fontSize={"md"}
            fontWeight={600}
            px="22px"
            textTransform={"capitalize"}
            wordBreak={"break-word"}
            whiteSpace={"nowrap"}
          ></chakra.span>
        </Box>
      </Box>
    );
  };

  const InventoryItem = ({
    item,
    isFull,
    qty,
  }: {
    item: BottleType;
    isFull: Boolean;
    qty: number;
  }) => {
    return (
      <Stack
        bgColor="orange.900"
        w="100%"
        px="22px"
        borderRadius={"xl"}
        boxShadow={"md"}
        minH="44px"
        direction={ui.isMobileView ? "column" : "row"}
        spacing={ui.isMobileView ? 2 : "inherit"}
        alignItems={"center"}
        py={ui.isMobileView ? 4 : "inherit"}
      >
        <Text fontWeight={"600"} textColor={"white.100"}>
          {isFull ? "Full" : "Empty"} {item.name} bottles: {qty}
        </Text>
        <Spacer />
        <Flex flexWrap={"wrap"}>
          {!isFull && (
            <Button
              colorScheme="blue"
              size="sm"
              variant={"solid"}
              onClick={() => {
                handleRefillClick({ item });
              }}
            >
              Refill
            </Button>
          )}
          {qty > 0 && isFull && (
            <Button
              colorScheme="blue"
              size="sm"
              variant={"solid"}
              onClick={() => {
                handlePourClick({ item, qty });
              }}
            >
              Open
            </Button>
          )}
          {(!isFull || qty > 0) && (
            <RouteButton
              isDisabled={qty > 0 ? false : true}
              size="sm"
              variant="solid"
              colorScheme="purple"
              href="http://opensea.io"
            >
              List on opensea
            </RouteButton>
          )}
        </Flex>
      </Stack>
    );
  };
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
