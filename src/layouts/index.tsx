import { ConnectWallet, WalletInfo } from "@/components";
import { menus } from "@/constants";
import {
    Flex,
    Heading,
    Spacer,
    Tab,
    TabList,
    Tabs,
    Text,
} from "@chakra-ui/react";
import Link from "next/link";
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
            <Flex>
                <Heading size="lg" fontWeight="bold">
                    Blockchain Trainee
                </Heading>
                <Spacer />

                {menus.map((menu) => (
                    <Link href={menu.url} key={menu.url}>
                        <Text
                            mx="20px"
                            fontSize="20px"
							borderBottom={currentMenu.url === menu.url ? "3px solid rgba(254,223,86,.6)" : "none"}
							color={currentMenu.url === menu.url ? "white" : "gray.500"}
                        >
                            {menu.name}
                        </Text>
                    </Link>
                ))}

                {!isConnected ? <ConnectWallet /> : <WalletInfo />}
            </Flex>
            <Flex w="full" flexDirection="column" py="50px">
                {children}
            </Flex>
        </Flex>
    );
}
