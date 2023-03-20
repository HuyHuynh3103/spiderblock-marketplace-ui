import { ConnectWallet, WalletInfo } from "@/components";
import { menus } from "@/constants";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
	Button,
    Flex,
    Heading,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    SimpleGrid,
    Spacer,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
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
        <Flex
            w={{ base: "full", lg: "70%" }}
            flexDirection="column"
            margin="50px auto"
        >
            <Flex gap="10px" margin="auto 20px">
                <Heading
                    fontWeight="bold"
                    fontSize={{ base: "20px", lg: "30px" }}
                >
                    Blockchain Trainee
                </Heading>
                <Spacer />
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <Menu>
                        <MenuButton
							as={Button}
							rightIcon={<HamburgerIcon />}
						>
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
            <Flex flexDirection="column" m="10px">
                {children}
            </Flex>
        </Flex>
    );
}
