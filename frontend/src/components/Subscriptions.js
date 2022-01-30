import React, { useContext } from "react";
import SubscriptionsList from "./SubscriptionsList";
import { useSubscriptions } from "../core/hooks";
import {
  Center,
  Spinner,
  ScaleFade,
  Heading,
  Flex,
  Button,
} from "@chakra-ui/react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import OverlayContext from "../core/providers/OverlayProvider/context";
import { MODAL_TYPES } from "../core/providers/OverlayProvider/constants";

const Subscriptions = () => {
  const { subscriptionsCache } = useSubscriptions();
  const modal = useContext(OverlayContext);

  // TODO(zomglings): This should be imported from some common location. For now, copied from
  // pages/account/security.js. It was attempting to get imported from "./index", but is not defined
  // there.
  const headingStyle = {
    as: "h2",
    pt: 2,
    mb: 4,
    borderBottom: "solid",
    borderColor: "blue.50",
    borderBottomWidth: "2px",
  };

  const newSubscriptionClicked = () => {
    modal.toggleModal({ type: MODAL_TYPES.NEW_SUBSCRIPTON });
  };
  return (
    <>
      {subscriptionsCache.isLoading ? (
        <Center>
          <Spinner
            hidden={false}
            my={8}
            size="lg"
            color="blue.500"
            thickness="4px"
            speed="1.5s"
          />
        </Center>
      ) : (
        <ScaleFade in>
          <Heading {...headingStyle}> My Subscriptions </Heading>
          <Flex
            mt={4}
            overflow="initial"
            maxH="unset"
            height="100%"
            direction="column"
          >
            <Flex
              h="3rem"
              w="100%"
              bgColor="blue.50"
              borderTopRadius="xl"
              justifyContent="flex-end"
              alignItems="center"
            >
              {subscriptionsCache.data?.is_free_subscription_availible && (
                <Button
                  onClick={() => newSubscriptionClicked(true)}
                  mr={8}
                  colorScheme="green"
                  variant="solid"
                  size="sm"
                  rightIcon={<AiOutlinePlusCircle />}
                >
                  Add for free
                </Button>
              )}
              <Button
                onClick={() => newSubscriptionClicked(false)}
                mr={8}
                colorScheme="blue"
                variant="solid"
                size="sm"
                rightIcon={<AiOutlinePlusCircle />}
              >
                Add new
              </Button>
            </Flex>
            <SubscriptionsList data={subscriptionsCache.data} />
          </Flex>
        </ScaleFade>
      )}
    </>
  );
};

export default Subscriptions;
