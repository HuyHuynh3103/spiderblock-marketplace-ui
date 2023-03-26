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
import SpiderBlockTokenContract from "@/contracts/SpiderBlockTokenContract";
import SwitchNetwork from "./SwitchNetwork";
export default function WalletInfo() {
    const { address } = useAccount();
    const { data } = useBalance({ address });
    const { disconnect } = useDisconnect();
    const [token, setToken] = React.useState<{
        symbol: string;
        name: string;
        balance: number;
    }>({ symbol: "", name: "", balance: 0 });
    const getTokenInfo = React.useCallback(async () => {
        if (address) {
            const spiderBlockContract = new SpiderBlockTokenContract();
            const tokenBalance = await spiderBlockContract.balanceOf(address);
            const name = await spiderBlockContract.name();
            const symbol = await spiderBlockContract.symbol();
            setToken({ symbol, name, balance: tokenBalance });
        }
    }, [address]);

    React.useEffect(() => {
        getTokenInfo();
    }, [getTokenInfo]);
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
                <SwitchNetwork />
                <PopoverArrow />
                <PopoverBody>
                    Balance: {numberFormat(data?.formatted ?? 0)} {data?.symbol}
                </PopoverBody>
                <PopoverBody>
                    {token.name} Token: {token.balance} {token.symbol}
                </PopoverBody>
                <PopoverFooter>
                    <Button onClick={() => disconnect()}>Disconnect</Button>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    );
}
