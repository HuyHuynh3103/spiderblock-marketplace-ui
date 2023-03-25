import { ConnectWallet, WalletInfo } from "@/components";
import { menus } from "@/constants";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    SimpleGrid,
    Spacer,
    useDimensions,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

interface IProps {
    children: ReactNode;
}

export default function MainLayout({ children }: IProps) {
    const { isConnected } = useAccount();
    const { asPath } = useRouter();
    const [currentMenu, setCurrentMenu] = React.useState(menus[0]);
    React.useEffect(() => {
        const path = asPath.split("/")[0];
        console.log(path);
        const menu = menus.find((menu) => menu.url === asPath);
        if (menu) {
            setCurrentMenu(menu);
        }
    }, [asPath]);

    return (
        <Box w="100vw" h="100vh" flexDirection="column" padding={{base: "50px 20px" , lg:"50px"}}>
            <Flex gap="10px">
                <Heading
					color="#fedf56"
                    fontWeight="bold"
                    fontSize={{ base: "20px", lg: "30px" }}
                >
                    Spider Block Marketplace
                </Heading>
                <Spacer />
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<HamburgerIcon />}>
                            {currentMenu.name}
                        </MenuButton>
                        <MenuList>
                            {menus.map((menu, index) => (
                                <MenuItem as="a" href={menu.url} key={index}>
                                    {menu.name}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    {!isConnected ? <ConnectWallet /> : <WalletInfo />}
                </SimpleGrid>
            </Flex>

            <Flex flexDirection="column" mt="10px">
                <Heading
                    fontSize={{ base: "18px", lg: "25px" }}
                >
                    {currentMenu.header}
                </Heading>
                <Divider my="10px" />
                {children}
            </Flex>
        </Box>
    );
}
