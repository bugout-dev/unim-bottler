import React, { useContext } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  chakra,
  Image,
  Spinner,
} from "@chakra-ui/react";
import useBottler, { BottleType } from "../core/hooks/useBottler";
import OverlayContext from "../core/providers/OverlayProvider/context";
import { MODAL_TYPES } from "../core/providers/OverlayProvider/constants";
import { BOTTLER_ADDRESS, UNIM_ADDRESS } from "../AppDefintions";
import { targetChain } from "../core/providers/Web3Provider";

const BottleCard = ({
  bottle,
  isDisabled,
}: // volume,
// bottlesLeft,
// fullBottlePrice,
{
  bottle: BottleType;
  isDisabled: boolean;
  // volume: number;
  // bottlesLeft: number;
  // fullBottlePrice: number;
}) => {
  const overlay = useContext(OverlayContext);
  const handleCardClick = (bottle: BottleType) => {
    overlay.toggleModal({
      type: MODAL_TYPES.FILL_BOTTLE,
      props: { bottle: bottle, refill: false },
    });
  };

  const bottler = useBottler({
    MilkAddress: UNIM_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain: targetChain,
  });

  return (
    <Box
      onClick={isDisabled ? undefined : () => handleCardClick(bottle)}
      borderRadius="xl"
      boxShadow={"lg"}
      w="240px"
      h="460px"
      maxH="460px"
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
        h="460px"
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
          <Text color={"gray.500"} fontSize={"sm"} textTransform={"uppercase"}>
            {bottle.name} bottle
          </Text>

          <Stack direction={"row"} align={"center"}>
            <Text fontWeight={800} fontSize={"xl"}>
              {bottler.bottleVolumesCache.isLoading ? (
                <Spinner size="xs" m={0} />
              ) : bottler.bottleVolumesCache.data ? (
                bottler.bottleVolumesCache.data[bottle.poolId].matic ?? 0
              ) : (
                0
              )}{" "}
              UNIM
            </Text>
          </Stack>

          <Stack direction={"row"} align={"center"}>
            <Text fontWeight={800} fontSize={"xl"}>
              {bottler.fullBottlesCache.isLoading ? (
                <Spinner size="xs" m={0} />
              ) : bottler.fullBottlesPricesCache.data ? (
                bottler.fullBottlesPricesCache.data[bottle.poolId].matic ?? 0
              ) : (
                0
              )}{" "}
              MATIC
            </Text>
          </Stack>

          <Text fontWeight={800} fontSize={"sm"} px={4}>
            {bottler.bottlesLeftCache.isLoading ? (
              <Spinner size="xs" m="0" />
            ) : bottler.bottlesLeftCache.data ? (
              bottler.bottlesLeftCache.data[bottle.poolId] ?? 0
            ) : (
              0
            )}{" "}
            presale bottles left
          </Text>
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
export default BottleCard;
