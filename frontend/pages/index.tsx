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
} from "@chakra-ui/react";
import { DEFAULT_METATAGS } from "../src/core/constants";
import Web3 from "web3";
import { provider } from "web3-core";
import Web3Context from "../src/core/providers/Web3Provider/context";
import { BOTTLE_TYPES, BottleTypes, BottleType } from "../src/AppDefintions";
const ONBOARD_TEXT = "Click here to install MetaMask!";
const CONNECT_TEXT = "Connect";
const CONNECTED_TEXT = "Connected";
const assets = undefined;
import { MODAL_TYPES } from "../src/core/providers/OverlayProvider/constants";
import overlayContext from "../src/core/providers/OverlayProvider/context";
import ProductSimple from "../src/components/BottleCard";

const Homepage = () => {
  const web3Provider = useContext(Web3Context);
  const overlay = useContext(overlayContext);

  const handleCardClick = (bottle: BottleType) => {
    console.log(bottle.name);
    overlay.toggleModal({
      type: MODAL_TYPES.FILL_BOTTLE,
      props: { bottle: bottle },
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
          <Heading>
            Your account UNIM tokens: {web3Provider.erc20Balance}{" "}
          </Heading>
          <Stack
            maxW="1024px"
            px={4}
            bgColor={"purple.200"}
            h="600px"
            w="100%"
            placeSelf={"center"}
            borderRadius="lg"
            boxShadow="xl"
          >
            <Heading>Fill your milk in to bottles</Heading>
            <Stack direction={"row"} justifyContent={"space-evenly"}>
              <BottleCard
                bottle={BOTTLE_TYPES.small}
                isDisabled={
                  Number(web3Provider.erc20Balance) < BOTTLE_TYPES.small.volume
                }
              />
              <BottleCard
                bottle={BOTTLE_TYPES.medium}
                isDisabled={
                  Number(web3Provider.erc20Balance) < BOTTLE_TYPES.medium.volume
                }
              />
              <BottleCard
                bottle={BOTTLE_TYPES.large}
                isDisabled={
                  Number(web3Provider.erc20Balance) < BOTTLE_TYPES.large.volume
                }
              />
            </Stack>
          </Stack>
          <Stack
            maxW="1024px"
            px={4}
            bgColor={"purple.200"}
            h="600px"
            w="100%"
            placeSelf={"center"}
            borderRadius="lg"
            boxShadow="xl"
          >
            <Heading>My inventory</Heading>
            <Stack direction={"column"} justifyContent={"space-evenly"}>
              <Stack
                bgColor="pink.400"
                w="100%"
                px="22px"
                minH="44px"
                direction="row"
                alignItems={"center"}
              >
                <Text>
                  {" "}
                  Number of full small bottles: {web3Provider.fullBottles[0]}
                </Text>
                <Spacer />
                {web3Provider.fullBottles[0] && (
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={() => {
                      web3Provider.emptySmallBottles(
                        web3Provider.fullBottles[0]
                      );
                    }}
                  >
                    Empty now!
                  </Button>
                )}
              </Stack>
              <Stack
                bgColor="pink.400"
                w="100%"
                px="22px"
                minH="44px"
                direction="row"
                alignItems={"center"}
              >
                <Text>
                  {" "}
                  Number of full medium bottles: {web3Provider.fullBottles[1]}
                </Text>
                <Spacer />
                {web3Provider.fullBottles[1] && (
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={() => {
                      web3Provider.emptyMediumBottles(
                        web3Provider.fullBottles[1]
                      );
                    }}
                  >
                    Empty now!
                  </Button>
                )}
              </Stack>
              <Stack
                bgColor="pink.400"
                w="100%"
                px="22px"
                minH="44px"
                direction="row"
                alignItems={"center"}
              >
                <Text>
                  {" "}
                  Number of full large bottles: {web3Provider.fullBottles[2]}
                </Text>
                <Spacer />
                {web3Provider.fullBottles[2] && (
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={() => {
                      web3Provider.emptyLargeBottles(
                        web3Provider.fullBottles[2]
                      );
                    }}
                  >
                    Empty now!
                  </Button>
                )}
              </Stack>
              <Stack bgColor="pink.400" w="100%" px="22px" minH="44px">
                <Text>
                  {" "}
                  Number of empty small bottles: {web3Provider.emptyBottles[0]}
                </Text>
              </Stack>
              <Stack bgColor="pink.400" w="100%" px="22px" minH="44px">
                <Text>
                  {" "}
                  Number of empty medium bottles: {web3Provider.emptyBottles[1]}
                </Text>
              </Stack>
              <Stack bgColor="pink.400" w="100%" px="22px" minH="44px">
                <Text>
                  {" "}
                  Number of empty large bottles: {web3Provider.emptyBottles[2]}
                </Text>
              </Stack>
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
