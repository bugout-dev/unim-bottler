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
  Spinner,
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
  const [numberOfBottles, setNumber] = React.useState<number>(1);
  const [canAfford, setCanAfford] = React.useState<boolean>(true);
  const [requiredMilk, setRequiredMilk] = React.useState<number>(0);

  const web3Provider = useContext(Web3Context);
  const bottler = useBottler({
    MilkAddress: UNIM_ADDRESS,
    BottlerAddress: BOTTLER_ADDRESS,
    targetChain:
      process.env.NODE_ENV === "development"
        ? chains.matic_mumbai
        : chains.matic,
  });

  const [valueToApprove, setValueToApprove] = React.useState<number>(0);

  let fillMethod: web3MethodCall = props.refill
    ? bottler.fillEmptyBottles
    : bottler.fillBottles;

  React.useEffect(() => {
    // const erc20Balance = Number(bottler.erc20Balance);
    if (
      bottler.bottleVolumesCache.data &&
      !bottler.bottleVolumesCache.isLoading &&
      bottler.balanceCache.data &&
      !bottler.balanceCache.isLoading
    ) {
      setCanAfford(
        numberOfBottles *
          bottler.bottleVolumesCache.data[props.bottle.poolId].matic <=
          bottler.balanceCache.data
          ? true
          : false
      );
    }
  }, [
    numberOfBottles,
    props.bottle,
    bottler.bottleVolumesCache,
    bottler.balanceCache,
  ]);

  React.useEffect(() => {
    if (bottler.allowanceCache.data && !bottler.allowanceCache.isLoading) {
      const currentAllowance = Number(bottler.allowanceCache.data);
      const needsApproval = currentAllowance >= requiredMilk ? false : true;
      setValueToApprove(needsApproval ? requiredMilk - currentAllowance : 0);
    }
  }, [bottler.allowanceCache, numberOfBottles, requiredMilk]);

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

  React.useEffect(() => {
    if (bottler.bottleVolumesCache.data) {
      setRequiredMilk(
        bottler.bottleVolumesCache.data[props.bottle.poolId].matic *
          numberOfBottles
      );
    }
  }, [bottler.bottleVolumesCache.data, numberOfBottles, props.bottle.poolId]);

  const handleSubmitClick = () => {
    if (bottler.fullBottlesPricesCache.data) {
      var temp = new BN(numberOfBottles);
      const weiToPay = temp.mul(
        bottler.fullBottlesPricesCache.data[props.bottle.poolId].bn
      );
      fillMethod.send(
        props.bottle.poolId,
        web3Provider.web3.utils.toBN(numberOfBottles),
        {
          value: props.refill ? 0 : weiToPay,
        }
      );
    } else {
      console.warn(
        "Fill bottle click should not be accessible if no bottlePrices"
      );
    }
  };

  if (
    !bottler.allowanceCache.data ||
    bottler.allowanceCache.isLoading ||
    !bottler.bottleVolumesCache.data ||
    !bottler.emptyBottlesCache.data
  )
    return <Spinner />;

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
              props.refill
                ? bottler.emptyBottlesCache.data[props.bottle.poolId]
                : 1000001
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
          {bottler.bottleVolumesCache.data[props.bottle.poolId].matic}. In order
          to fill a bottle, the bottler must have your approval to use{" "}
          {requiredMilk} of your UNIM tokens. Currently you have approved{" "}
          {bottler.allowanceCache.data}.{" "}
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
            onClick={() => handleSubmitClick()}
          >
            Submit
          </Button>
        )}
      </Stack>
    </Center>
  );
};
export default FillBottle;
