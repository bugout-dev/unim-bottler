import React, { useContext } from "react";
import { Stack, Button, Text, Spacer, Flex } from "@chakra-ui/react";
import { BottleType } from "../core/hooks/useBottler";
import OverlayContext from "../core/providers/OverlayProvider/context";
import UIcontext from "../core/providers/UIProvider/context";
import { MODAL_TYPES } from "../core/providers/OverlayProvider/constants";
import RouteButton from "./RouteButton";
import { TERMINUS_ADDRESS } from "../AppDefintions";
const InventoryItem = ({
  item,
  isFull,
  qty,
}: {
  item: BottleType;
  isFull: Boolean;
  qty: number;
}) => {
  const overlay = useContext(OverlayContext);
  const ui = useContext(UIcontext);
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
      props: { bottle: item, refill: true },
    });
  };

  return (
    <Stack
      bgColor="#ca6510"
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
            size="sm"
            isDisabled={qty === 0}
            variant={"solid"}
            colorScheme="purple"
            onClick={() => {
              handleRefillClick({ item });
            }}
          >
            Refill
          </Button>
        )}
        {isFull && (
          <Button
            colorScheme="purple"
            size="sm"
            isDisabled={qty > 0 ? false : true}
            variant={"solid"}
            onClick={() => {
              handlePourClick({ item, qty });
            }}
          >
            Open
          </Button>
        )}
        {isFull && (
          <RouteButton
            isDisabled={qty > 0 ? false : true}
            size="sm"
            variant="solid"
            colorScheme={qty > 0 ? "blue" : "purple"}
            href={`http://opensea.io/${TERMINUS_ADDRESS}/${item.terminusPoolId}`}
            bgColor={qty > 0 ? undefined : "orange.1200"}
          >
            List on opensea
          </RouteButton>
        )}
        {!isFull && (
          <RouteButton
            isDisabled={qty > 0 ? false : true}
            size="sm"
            variant="solid"
            colorScheme={qty > 0 ? "blue" : "purple"}
            href={`http://opensea.io/${TERMINUS_ADDRESS}/${
              item.terminusPoolId - 3
            }`}
            bgColor={qty > 0 ? undefined : "orange.1200"}
          >
            List on opensea
          </RouteButton>
        )}
      </Flex>
    </Stack>
  );
};

export default InventoryItem;
