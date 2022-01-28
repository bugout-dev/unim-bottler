import React from "react";
import {
  Text,
  Link,
  Box,
  Container,
  SimpleGrid,
  Stack,
  Image as ChakraImage,
  useColorModeValue,
  VisuallyHidden,
  chakra,
} from "@chakra-ui/react";
import RouterLink from "next/link";
import {
  WHITE_LOGO_W_TEXT_URL,
  ALL_NAV_PATHES,
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
  COPYRIGHT_NAME,
} from "../core/constants";
import { FaGithub, FaTwitter, FaDiscord } from "react-icons/fa";
import { v4 } from "uuid";
import moment from "moment";

const LINKS_SIZES = {
  fontWeight: "300",
  fontSize: "lg",
};

const ListHeader = ({ children }) => {
  return (
    <Text
      fontWeight={"500"}
      fontSize={"lg"}
      mb={2}
      borderBottom="1px"
      borderColor="blue.700"
      textColor="blue.500"
    >
      {children}
    </Text>
  );
};

const SocialButton = ({ children, label, href }) => {
  return (
    <chakra.button
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
      rounded={"full"}
      w={8}
      h={8}
      cursor={"pointer"}
      as={"a"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"background 0.3s ease"}
      _hover={{
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

const Footer = () => (
  <Box
    bg={useColorModeValue("blue.900", "gray.900")}
    color={useColorModeValue("gray.700", "gray.200")}
  >
    <Container as={Stack} maxW={"6xl"} py={10}>
      <SimpleGrid
        templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 2fr" }}
        spacing={8}
      >
        <Stack spacing={6}>
          <Box>
            <Link href="/" alignSelf="center">
              <ChakraImage
                alignSelf="center"
                // as={Link}
                // to="/"
                h="2.5rem"
                minW="2.5rem"
                src={WHITE_LOGO_W_TEXT_URL}
                alt="Logo"
              />
            </Link>
          </Box>
          <Text fontSize={"sm"}>
            © {moment().year()} {COPYRIGHT_NAME} All rights reserved
          </Text>
          <Stack direction={"row"} spacing={6}>
            {SOCIAL_LINKS.map((social_link, idx) => {
              return (
                <SocialButton
                  key={`social-links-${idx}`}
                  label={social_link.label}
                  href={social_link.url}
                >
                  {social_link.label === "Twitter" && <FaTwitter />}
                  {social_link.label === "Github" && <FaGithub />}
                  {social_link.label === "Discord" && <FaDiscord />}
                </SocialButton>
              );
            })}
          </Stack>
        </Stack>
        {Object.values(FOOTER_COLUMNS).map((columnEnum) => {
          return (
            <Stack align={"flex-start"} key={v4()}>
              {ALL_NAV_PATHES.filter(
                (navPath) => navPath.footerCategory === columnEnum
              ).length > 0 && (
                <>
                  <ListHeader>{columnEnum}</ListHeader>
                  {ALL_NAV_PATHES.filter(
                    (navPath) => navPath.footerCategory === columnEnum
                  ).map((linkItem) => {
                    return (
                      <RouterLink passHref href={linkItem.path} key={v4()}>
                        <Link {...LINKS_SIZES}>{linkItem.title}</Link>
                      </RouterLink>
                    );
                  })}
                </>
              )}
            </Stack>
          );
        })}
      </SimpleGrid>
    </Container>
  </Box>
);

export default Footer;
