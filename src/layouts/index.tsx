declare var window: any;

import { ConnectWallet, WalletInfo, SuccessModal } from "@/components";
import { menus, packages } from "@/constants";
import { setWalletInfo, setWeb3Provider } from "@/reduxs/accounts/account.slices";
import { useAppDispatch, useAppSelector } from "@/reduxs/hooks";
import { InvestCard } from "@/views/invests/components";
import { IPackage, EToken } from "@/_types_";
import { Flex, Heading, Spacer, SimpleGrid, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import Link from "next/link";
import React, { ReactNode } from "react";

interface IProps {
    children: ReactNode;
}

export default function MainLayout({ children }: IProps) {
	const dispatch = useAppDispatch();
	const {wallet} = useAppSelector((state)=>state.account);
	const onConnectMetamask = async () => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(
                window.ethereum,
                undefined
            );
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const bigBalance = await signer.getBalance();
            const nativeBalance = Number.parseFloat(
                ethers.utils.formatEther(bigBalance)
            );
            dispatch(setWalletInfo({address, nativeAmt: nativeBalance}));
			dispatch(setWeb3Provider(provider))
        }
    };
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
                {!wallet ? (
                    <ConnectWallet onClick={onConnectMetamask} />
                ) : (
                    <WalletInfo
                        address={wallet?.address}
                        amount={wallet?.nativeAmt || 0}
                    />
                )}
            </Flex>
            <Flex w="full" flexDirection="column" py="50px">
                {children}
            </Flex>
        </Flex>
    );
}
