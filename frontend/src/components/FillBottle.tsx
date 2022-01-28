import React, { Fragment, useContext } from "react";
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
import { BottleType } from "../AppDefintions";
import Web3Context from "../core/providers/Web3Provider/context";

const FillBottle = (props: { bottle: BottleType }) => {
  console.log("FillBottle", props);
  const [numberOfBottles, setNumber] = React.useState<number>(1);
  const [canAfford, setCanAfford] = React.useState<boolean>(true);
  const requiredMilk = props.bottle.volume * numberOfBottles;
  const web3Provider = useContext(Web3Context);
  const [valueToApprove, setValueToApprove ] = React.useState<number>(0);

  React.useEffect(() => {
    const erc20Balance = Number(web3Provider.erc20Balance);
    setCanAfford(numberOfBottles * props.bottle.volume <= erc20Balance ? true : false);
  }, [numberOfBottles, props.bottle, web3Provider.erc20Balance]);


  React.useEffect(() => {
    const needsApproval =  Number(web3Provider.allowance) >= requiredMilk ? false : true;
    setValueToApprove(needsApproval ? requiredMilk - Number(web3Provider.allowance) : 0
    );
  }, [web3Provider.allowance, numberOfBottles ]);


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
            min={1}
            max={10001}
            w="123px"
            onChange={(valueAsString) => setNumber(Number(valueAsString))}
          >
            <NumberInputField />
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
          {web3Provider.allowance}.{" "}
          {valueToApprove !== 0 &&
            `We need ${valueToApprove}`}
        </Text>
        {valueToApprove !== 0 && (
          <Button
            isDisabled={!canAfford}
            placeSelf={"center"}
            colorScheme="blue"
            variant="solid"
            onClick={() => web3Provider.approve(requiredMilk)}
          >
            {!canAfford && "You don't have enough milk!"}
            {canAfford && "Approve"}
          </Button>
        )}
        {valueToApprove === 0 && (
          <Button
            isDisabled={!canAfford}
            placeSelf={"center"}
            colorScheme="blue"
            variant="solid"
            onClick={() => web3Provider.submit({amount: numberOfBottles, bottle: props.bottle})}
          >
            Submit
          </Button>
        )}
      </Stack>
    </Center>
  );
};
export default FillBottle;
