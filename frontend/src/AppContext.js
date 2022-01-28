import React, { useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./Theme/theme";
import {
  AnalyticsProvider,
  UserProvider,
  UIProvider,
  DataProvider,
  OverlayProvider,
  Web3Provider,
} from "./core/providers";
import { StripeProvider } from "./core/providers/StripeProvider";

const AppContext = (props) => {
  useEffect(() => {
    const version = "0.0.1";
    if (version) console.log(`Frontend version: ${version}`);
    else
      console.error(
        "NEXT_PUBLIC_FRONTEND_VERSION version variable is not exported"
      );
  }, []);
  return (
    <Web3Provider>
      <UserProvider>
        <StripeProvider>
          <ChakraProvider theme={theme}>
            <DataProvider>
              <UIProvider>
                <OverlayProvider>
                  <AnalyticsProvider>{props.children}</AnalyticsProvider>
                </OverlayProvider>
              </UIProvider>
            </DataProvider>
          </ChakraProvider>
        </StripeProvider>
      </UserProvider>
    </Web3Provider>
  );
};

export default AppContext;
