import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "react-pro-sidebar";
import { useContext } from "react";
import RouterLink from "next/link";
import {
  Flex,
  Image,
  IconButton,
  Divider,
  Text,
  ButtonGroup,
  Button,
  Badge,
  Stack,
} from "@chakra-ui/react";
import UIContext from "../core/providers/UIProvider/context";
import React from "react";
import {
  HamburgerIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  LockIcon,
} from "@chakra-ui/icons";
import { MdSettings, MdDashboard, MdTimeline } from "react-icons/md";
import {
  WHITE_LOGO_W_TEXT_URL,
  ALL_NAV_PATHES,
  IS_AUTHENTICATION_REQUIRED,
  COPYRIGHT_NAME,
} from "../core/constants";
import { v4 } from "uuid";
import useDashboard from "../core/hooks/useDashboard";
import { MODAL_TYPES } from "../core/providers/OverlayProvider/constants";
import OverlayContext from "../core/providers/OverlayProvider/context";
import moment from "moment";
import Web3Context from "../core/providers/Web3Provider/context";

const Sidebar = () => {
  const ui = useContext(UIContext);
  const web3Provider = useContext(Web3Context);
  const overlay = useContext(OverlayContext);
  return (
    <ProSidebar
      width="240px"
      breakPoint="lg"
      toggled={ui.sidebarToggled}
      onToggle={ui.setSidebarToggled}
      collapsed={ui.sidebarCollapsed}
      hidden={!ui.sidebarVisible}
    >
      <SidebarHeader>
        <Flex>
          <IconButton
            ml={4}
            justifySelf="flex-start"
            colorScheme="blue"
            aria-label="App navigation"
            icon={
              ui.isMobileView ? (
                <HamburgerIcon />
              ) : ui.sidebarCollapsed ? (
                <ArrowRightIcon />
              ) : (
                <ArrowLeftIcon />
              )
            }
            onClick={() => {
              ui.isMobileView
                ? ui.setSidebarToggled(!ui.sidebarToggled)
                : ui.setSidebarCollapsed(!ui.sidebarCollapsed);
            }}
          />
          <RouterLink href="/" passHref>
            <Image
              // h="full"
              // maxH="100%"
              maxW="120px"
              py="0.75rem"
              pl={5}
              src={WHITE_LOGO_W_TEXT_URL}
              alt="Logo"
            />
          </RouterLink>
        </Flex>
      </SidebarHeader>
      <SidebarContent>
        <Divider borderColor="blue.600" />
        <Menu iconShape="square">
          {!ui.isLoggedIn && IS_AUTHENTICATION_REQUIRED && (
            <>
              <MenuItem
                onClick={() => {
                  overlay.toggleModal({ type: MODAL_TYPES.SIGNUP });
                  ui.setSidebarToggled(false);
                }}
              >
                Sign up
              </MenuItem>

              <MenuItem
                onClick={() => {
                  overlay.toggleModal({ type: MODAL_TYPES.LOGIN });
                  ui.setSidebarToggled(false);
                }}
              >
                Login
              </MenuItem>
              {ui.isMobileView &&
                ALL_NAV_PATHES.map((pathToLink) => {
                  return (
                    <MenuItem key={v4()}>
                      <RouterLink href={pathToLink.path}>
                        {pathToLink.title}
                      </RouterLink>
                    </MenuItem>
                  );
                })}
            </>
          )}
          {ui.isLoggedIn ||
            (!IS_AUTHENTICATION_REQUIRED && (
              <>
                {/* Not authenticated part of sidebar menu */}
                <ButtonGroup variant="solid" spacing={4} pr={16}>
                  {web3Provider.buttonText !==
                    web3Provider.WALLET_STATES.CONNECTED && (
                    <Button
                      colorScheme={
                        web3Provider.buttonText ===
                        web3Provider.WALLET_STATES.CONNECTED
                          ? "green"
                          : "green"
                      }
                      onClick={web3Provider.onConnectWalletClick}
                    >
                      {web3Provider.buttonText}
                      {"  "}
                      <Image
                        pl={2}
                        h="24px"
                        src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
                      />
                    </Button>
                  )}
                  {web3Provider.buttonText ===
                    web3Provider.WALLET_STATES.CONNECTED && (
                    <Flex direction="column">
                      <Badge
                        ml={4}
                        maxW="200px"
                        colorScheme={"green"}
                        variant={"subtle"}
                        fontSize={"sm"}
                      >
                        Connected
                      </Badge>
                      <Badge
                        ml={4}
                        mt={2}
                        maxW="200px"
                        colorScheme={"orange"}
                        variant={"subtle"}
                        fontSize={"sm"}
                        wordBreak={"break-word"}
                        whiteSpace={"normal"}
                      >{` ${web3Provider.account}`}</Badge>
                    </Flex>
                  )}
                </ButtonGroup>
              </>
            ))}
          <Divider
            colorScheme="blue"
            bgColor="gray.300"
            color="blue.700"
            borderColor="blue.700"
          />
        </Menu>
      </SidebarContent>

      <SidebarFooter style={{ paddingBottom: "3rem" }}>
        <Divider color="gray.300" w="100%" />
        {ui.isLoggedIn && (
          <Menu iconShape="square">
            <MenuItem icon={<MdSettings />}>
              <RouterLink href="/subscriptions">Subscriptions </RouterLink>
            </MenuItem>
            <MenuItem icon={<MdTimeline />}>
              <RouterLink href="/stream">Stream</RouterLink>
            </MenuItem>
            <MenuItem icon={<LockIcon />}>
              <RouterLink href="/account/tokens">API Tokens</RouterLink>
            </MenuItem>
            <Divider />
            <Text
              pt={4}
              fontSize={"sm"}
              textColor="gray.700"
              textAlign="center"
            >
              © {moment().year()} {COPYRIGHT_NAME}
            </Text>
          </Menu>
        )}
      </SidebarFooter>
    </ProSidebar>
  );
};

export default Sidebar;
