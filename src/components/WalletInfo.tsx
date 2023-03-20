import { Button, HStack, Image, SimpleGrid, Text } from "@chakra-ui/react";
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
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <Button variant="outline">
                    <HStack>
                        <Text>{showSortAddress(address)}</Text>
                        <Image
                            src="/bnb.png"
                            w={{ base: "20px", lg: "25px" }}
                            alt="bnb"
                        />
                    </HStack>
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />
                <PopoverBody>
                    Balance: {numberFormat(data?.formatted ?? 0)} {data?.symbol}
                </PopoverBody>
                <PopoverFooter>
                    <Button onClick={() => disconnect()}>Disconnect</Button>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    );
}
