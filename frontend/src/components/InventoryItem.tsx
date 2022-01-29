import React, { useContext } from "react";
import { Stack, Button, Text, Spacer, Flex } from "@chakra-ui/react";
import { BottleType } from "../core/hooks/useBottler";
import OverlayContext from "../core/providers/OverlayProvider/context";
import UIcontext from "../core/providers/UIProvider/context";
import { MODAL_TYPES } from "../core/providers/OverlayProvider/constants";
import RouteButton from "./RouteButton";
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
      props: { bottle: item },
    });
  };

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

export default InventoryItem;
