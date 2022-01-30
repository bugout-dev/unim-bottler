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
import Web3Context, {
  txStatus,
  web3MethodCall,
} from "../core/providers/Web3Provider/context";
import useBottler, { BottleType } from "../core/hooks/useBottler";
import { chains } from "../core/providers/Web3Provider";
import overlayContext from "../core/providers/OverlayProvider/context";
import { MODAL_TYPES } from "../core/providers/OverlayProvider/constants";
import BN from "bn.js";

const FillBottle = (props: { bottle: BottleType; refill: boolean }) => {
  const { toggleModal } = useContext(overlayContext);
  console.log("FillBottle", props);
  const [numberOfBottles, setNumber] = React.useState<number>(1);
  const [canAfford, setCanAfford] = React.useState<boolean>(true);
  const web3Provider = useContext(Web3Context);
  const bottler = useBottler({
    MilkAddress: UNIM_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain:
      process.env.NODE_ENV === "development"
        ? chains.matic_mumbai
        : chains.matic,
  });
  const requiredMilk =
    bottler.bottleVolumes[props.bottle.poolId] * numberOfBottles;
  const [valueToApprove, setValueToApprove] = React.useState<number>(0);

  let fillMethod: web3MethodCall = props.refill
    ? bottler.fillEmptyBottles
    : bottler.fillBottles;

  React.useEffect(() => {
    const erc20Balance = Number(bottler.erc20Balance);
    setCanAfford(
      numberOfBottles * bottler.bottleVolumes[props.bottle.poolId] <=
        erc20Balance
        ? true
        : false
    );
  }, [
    numberOfBottles,
    props.bottle,
    bottler.erc20Balance,
    bottler.bottleVolumes,
  ]);

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
      fillMethod.status === txStatus.ERROR ||
      fillMethod.status === txStatus.SUCCESS
    ) {
      toggleModal({ type: MODAL_TYPES.OFF });
    }
  }, [fillMethod.status, toggleModal]);

  var temp = new BN(numberOfBottles);

  const weiToPay = temp.mul(bottler.fullBottlePricesBN[props.bottle.poolId]);

  return (
    <Center>
      <Stack>
        <Image
          placeSelf={"center"}
          borderRadius="md"
          h="280px"
          w="280px"
          src={
            props.refill ? props.bottle.emptyImageURL : props.bottle.imageUrl
          }
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
            max={
              props.refill ? bottler.emptyBottles[props.bottle.poolId] : 1000001
            }
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
          Each {props.bottle.name} bottle contains{" "}
          {bottler.bottleVolumes[props.bottle.poolId]}. In order to fill a
          bottle, the bottler must have your approval to use {requiredMilk} of your
          UNIM tokens. Currently you have approved {bottler.allowance}.{" "}
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
                ),
                {}
              )
            }
          >
            {!canAfford && "You don't have enough milk!"}
            {canAfford && "Approve"}
          </Button>
        )}
        {valueToApprove === 0 && (
          <Button
            isLoading={fillMethod.status === txStatus.LOADING}
            isDisabled={!canAfford}
            placeSelf={"center"}
            colorScheme="green"
            variant="solid"
            onClick={() =>
              fillMethod.send(
                props.bottle.poolId,
                web3Provider.web3.utils.toBN(numberOfBottles),
                {
                  value: props.refill ? 0 : weiToPay,
                }
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
