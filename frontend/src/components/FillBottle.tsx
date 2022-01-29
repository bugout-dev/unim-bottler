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
import { BOTTLER_ADDRESS, MILK_ADDRESS } from "../AppDefintions";
import Web3Context, { txStatus } from "../core/providers/Web3Provider/context";
import useBottler, { BottleType } from "../core/hooks/useBottler";
import { chains } from "../core/providers/Web3Provider";
import overlayContext from "../core/providers/OverlayProvider/context";
import { MODAL_TYPES } from "../core/providers/OverlayProvider/constants";

const FillBottle = (props: { bottle: BottleType }) => {
  const { toggleModal } = useContext(overlayContext);
  console.log("FillBottle", props);
  const [numberOfBottles, setNumber] = React.useState<number>(1);
  const [canAfford, setCanAfford] = React.useState<boolean>(true);
  const requiredMilk = props.bottle.volume * numberOfBottles;
  const web3Provider = useContext(Web3Context);
  const bottler = useBottler({
    MilkAddress: MILK_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain:
      process.env.NODE_ENV === "development"
        ? chains.matic_mumbai
        : chains.matic,
  });
  const [valueToApprove, setValueToApprove] = React.useState<number>(0);

  React.useEffect(() => {
    const erc20Balance = Number(bottler.erc20Balance);
    setCanAfford(
      numberOfBottles * props.bottle.volume <= erc20Balance ? true : false
    );
  }, [numberOfBottles, props.bottle, bottler.erc20Balance]);

  React.useEffect(() => {
    const needsApproval =
      Number(bottler.allowance) >= requiredMilk ? false : true;
    setValueToApprove(
      needsApproval ? requiredMilk - Number(bottler.allowance) : 0
    );
  }, [bottler.allowance, numberOfBottles, requiredMilk]);

  React.useEffect(() => {
    if (bottler.approveSpendMilk.status === txStatus.ERROR) {
      toggleModal({ type: MODAL_TYPES.OFF });
    }
  }, [bottler.approveSpendMilk.status, toggleModal]);

  React.useEffect(() => {
    if (
      bottler.fillBottles.status === txStatus.ERROR ||
      bottler.fillBottles.status === txStatus.SUCCESS
    ) {
      toggleModal({ type: MODAL_TYPES.OFF });
    }
  }, [bottler.fillBottles.status, toggleModal]);

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
            How many bottles would you like to fill?
          </Text>
          <NumberInput
            defaultValue={1}
            bgColor={"purple.500"}
            min={1}
            max={1000001}
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
          Each {props.bottle.name} bottle contains {props.bottle.volume} In
          order to fill a bottle, bottler must have your approval to use{" "}
          {requiredMilk} of your UNIM tokens. Currently you have approved{" "}
          {bottler.allowance}.{" "}
          {valueToApprove !== 0 && `We need ${valueToApprove}`}
        </Text>
        {valueToApprove !== 0 && (
          <Button
            isLoading={bottler.approveSpendMilk.status === txStatus.LOADING}
            isDisabled={!canAfford}
            placeSelf={"center"}
            colorScheme="blue"
            variant="solid"
            onClick={() =>
              bottler.approveSpendMilk.send(
                BOTTLER_ADDRESS,
                web3Provider.web3.utils.toWei(
                  web3Provider.web3.utils.toBN(requiredMilk)
                )
              )
            }
          >
            {!canAfford && "You don't have enough milk!"}
            {canAfford && "Approve"}
          </Button>
        )}
        {valueToApprove === 0 && (
          <Button
            isLoading={bottler.fillBottles.status === txStatus.LOADING}
            isDisabled={!canAfford}
            placeSelf={"center"}
            colorScheme="green"
            variant="solid"
            onClick={() =>
              // bottler.fillBottles.send(props.bottle.poolId, numberOfBottles)
              bottler.fillBottles.send(
                web3Provider.web3.utils.toBN(numberOfBottles)
              )
            }
          >
            Submit
          </Button>
        )}
      </Stack>
    </Center>
  );
};
export default FillBottle;
