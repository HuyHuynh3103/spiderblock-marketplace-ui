import { Button, HStack, Image, Text } from "@chakra-ui/react";
import React from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { numberFormat, showSortAddress } from "../utils";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
} from "@chakra-ui/react";
export default function WalletInfo() {
    const { address } = useAccount();
    const { data } = useBalance({ address });
    const { disconnect } = useDisconnect();
    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="outline" ml="10px">
                    <HStack>
                        <Text>{showSortAddress(address)}</Text>
                        <Image src="/bnb.png" w="25px" alt="bnb" ml="202px" />
                        <Text>{numberFormat(data?.formatted ?? "0")}</Text>
                    </HStack>
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />
                <PopoverBody>
                    Balance: {data?.formatted} {data?.symbol}
                </PopoverBody>
                <PopoverFooter justifyItems='flex-end'>
                    <Button onClick={() => disconnect()}>Disconnect</Button>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    );
}
