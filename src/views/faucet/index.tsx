import { SuccessModal } from "@/components";
import getChainIdFromEnv from "@/contracts/utils/common";
import {
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Input,
    useBoolean,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import { getToast } from "@/utils";
import FaucetContract from "@/contracts/FaucetContract";

export default function FaucetView() {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { data: signer } = useSigner({ chainId: getChainIdFromEnv() });
    const { address, isConnected } = useAccount();
    const [faucetAmount, setFaucetAmount] = React.useState<number>(0);
    const [error, setError] = React.useState<string>("");
    const [loading, setLoading] = useBoolean();
    const [addressFaucet, setAddressFaucet] = React.useState<string>(
        address?.toString() || ""
    );
    const [txHash, setTxHash] = React.useState<string>();
    function validateAddress(value?: string) {
        return ethers.utils.isAddress(value || "") ? "" : "Invalid address";
    }

    const handleFaucet = async (address: String) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        setLoading.on();
        try {
            const faucetContract = new FaucetContract(signer);
            let hash = await faucetContract.faucet(address);
            setTxHash(hash);
            onOpen();
        } catch (err: any) {
            toast(getToast(err.reason || err.message));
        }
        setLoading.off();
    };
    const getFaucetAmount = useCallback(async () => {
        try {
            const faucetContract = new FaucetContract();
            let amount = await faucetContract.getFaucetAmount();
            setFaucetAmount(amount);
        } catch (err: any) {
            toast(getToast(err.reason || err.message));
        }
    }, []);
    React.useEffect(() => {
        if (address) {
            setAddressFaucet(address);
        }
    }, [address]);
    React.useEffect(() => {
        if (!addressFaucet) return;
        let error = validateAddress(addressFaucet);
        setError(error);
    }, [addressFaucet]);
    React.useEffect(() => {
        getFaucetAmount();
    }, [getFaucetAmount]);
    return (
        <Flex w="full">
            {/* History of the faucet transactions */}
            <FormControl isRequired isInvalid={error !== ""}>
                <FormLabel>Input address to get free USDT token</FormLabel>
                <Input
                    errorBorderColor="crimson"
                    value={addressFaucet}
                    onChange={(e) => setAddressFaucet(e.target.value)}
                    placeholder="0xdas..."
                />
                {!error ? (
                    <FormHelperText>
                        Faucet will send {faucetAmount} USDT token and once per
                        day per address
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>{error}</FormErrorMessage>
                )}
                <Button
                    mt={4}
                    colorScheme="teal"
                    isLoading={loading}
                    loadingText="Processing"
                    onClick={() => handleFaucet(addressFaucet)}
                    isDisabled={error !== "" || !isConnected}
                >
                    {!isConnected ? "Connect wallet first" : `Get ${faucetAmount} USDT`}
                </Button>
            </FormControl>
            <SuccessModal
                isOpen={isOpen}
                onClose={onClose}
                hash={txHash}
                title={`Faucet ${faucetAmount} USDT Successfully`}
            />
        </Flex>
    );
}
