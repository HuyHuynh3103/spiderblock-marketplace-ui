import { Button, ButtonProps } from "@chakra-ui/react";
import { useWeb3Modal } from "@web3modal/react";
import React, { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

export default function ConnectWallet() {
    const { open } = useWeb3Modal();
    const [loading, setLoading] = useState(false);
    const { isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    async function onOpen() {
        setLoading(true);
        await open();
        setLoading(false);
    }

    function onClick() {
        if (isConnected) {
            disconnect();
        } else {
            onOpen();
        }
    }
    return (
        <Button variant="primary" isLoading={loading} onClick={onClick}>
            Connect wallet
        </Button>
    );
}
