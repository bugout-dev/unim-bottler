import React, { useContext } from "react";
import {
  Image,
  Center,
  Button,
  Stack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { BOTTLER_ADDRESS, UNIM_ADDRESS } from "../AppDefintions";
import { txStatus } from "../core/providers/Web3Provider/context";
import useBottler, { BottleType } from "../core/hooks/useBottler";
import { chains } from "../core/providers/Web3Provider";
import overlayContext from "../core/providers/OverlayProvider/context";
import { MODAL_TYPES } from "../core/providers/OverlayProvider/constants";

const PourBottle = (props: { bottle: BottleType }) => {
  const { toggleModal } = useContext(overlayContext);
  console.log("FillBottle", props);
  const [numberOfBottles, setNumber] = React.useState<number>(1);
  const [canAfford, setCanAfford] = React.useState<boolean>(true);
  const bottler = useBottler({
    MilkAddress: UNIM_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain:
      process.env.NODE_ENV === "development"
        ? chains.matic_mumbai
        : chains.matic,
  });

  React.useEffect(() => {
    const erc20Balance = Number(bottler.erc20Balance);
    setCanAfford(
      numberOfBottles * props.bottle.volume <= erc20Balance ? true : false
    );
  }, [numberOfBottles, props.bottle, bottler.erc20Balance]);

  React.useEffect(() => {
    if (
      bottler.pourFullBottles.status === txStatus.ERROR ||
      bottler.pourFullBottles.status === txStatus.SUCCESS
    ) {
      toggleModal({ type: MODAL_TYPES.OFF });
    }
  }, [bottler.pourFullBottles.status, toggleModal]);

  const hasBottles = bottler.fullBottles[props.bottle.poolId];

  return (
    <Center>
      <Stack>
        <Image
          placeSelf={"center"}
          borderRadius="md"
          h="280px"
          w="280px"
          src={props.bottle.imageUrl}
        />
        <Stack
          direction={"row"}
          placeItems={"center"}
          w="100%"
          justifyContent={"space-evenly"}
        >
          <Text fontSize="18px" fontWeight={500}>
            How many bottles would you like to open?
          </Text>
          <NumberInput
            defaultValue={1}
            bgColor={"purple.500"}
            min={1}
            max={hasBottles}
            w="123px"
            onChange={(valueAsString) => setNumber(Number(valueAsString))}
          >
            <NumberInputField
              bgColor={"purple.1100"}
              _hover={{ bgColor: "purple.800" }}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Stack>
        <Text fontSize={"sm"}>
          Each {props.bottle.name} bottle contains {props.bottle.volume} UNIML.
          Performing this action will give you equivalent amount of UNIML... and
          an empty bottle
        </Text>

        <Button
          isLoading={bottler.pourFullBottles.status === txStatus.LOADING}
          isDisabled={!canAfford}
          placeSelf={"center"}
          colorScheme="green"
          variant="solid"
          onClick={() =>
            bottler.pourFullBottles.send(
              props.bottle.poolId,
              numberOfBottles,
              {}
            )
          }
        >
          Submit
        </Button>
      </Stack>
    </Center>
  );
};
export default PourBottle;
