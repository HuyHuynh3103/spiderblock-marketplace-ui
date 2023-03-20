import { ConnectWallet, WalletInfo } from "@/components";
import { menus } from "@/constants";
import { Flex, Heading, Spacer, Text } from "@chakra-ui/react";
import Link from "next/link";
import React, { ReactNode } from "react";
import { useAccount } from "wagmi";

interface IProps {
    children: ReactNode;
}

export default function MainLayout({ children }: IProps) {
    const { isConnected } = useAccount();
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
                        <Text mx="20px" fontSize="20px">
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
