declare var window: any;
import { SuccessModal } from "@/components";
import { packages } from "@/constants";
import CrowSaleContract from "@/contracts/CrowdSaleContract";
import UsdtContract from "@/contracts/UsdtContract";
import { EToken, IPackage, IRate, IWalletInfo } from "@/_types_";
import { SimpleGrid, useDisclosure } from "@chakra-ui/react";
import { ethers } from "ethers";
import React from "react";
import { InvestCard } from "./components";

export default function InvestView() {
    const [wallet, setWallet] = React.useState<IWalletInfo>();
    const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
    const [pak, setPak] = React.useState<IPackage>();
    const [rate, setRate] = React.useState<IRate>({ bnbRate: 0, usdtRate: 0 });
    const [txHash, setTxHash] = React.useState<string>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [web3Provider, setWeb3Provider] =
        React.useState<ethers.providers.Web3Provider>();
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
            setWeb3Provider(provider);
            setWallet({
                address,
                nativeAmt: nativeBalance,
            });
        }
    };
    const handleBuyIco = async (pak: IPackage) => {
        if (!web3Provider) return;
        setPak(pak);
        setIsProcessing(true);
        let hash = "";
        const crowdContract = new CrowSaleContract(web3Provider);
        switch (pak.token) {
            case EToken.BNB:
                hash = await crowdContract.buyTokenByNative(pak.amount);
                break;
            case EToken.USDT:
                const usdtContract = new UsdtContract(web3Provider);
                await usdtContract.approve(
                    crowdContract._contractAddress,
                    pak.amount * rate.usdtRate
                );
                hash = await crowdContract.buyTokenByErc20(pak.amount);
                break;
            default:
                console.error("Token not recognized");
                break;
        }
        setTxHash(hash);
        onOpen();
        try {
        } catch (err: any) {}
        setPak(undefined);
        setIsProcessing(false);
    };
    const getRate = React.useCallback(async () => {
        const crowdContract = new CrowSaleContract();
        const nativeRate = await crowdContract.getNativeRate();
        const erc20Rate = await crowdContract.getPaymentRate();
        setRate({ bnbRate: nativeRate, usdtRate: erc20Rate });
    }, []);
    React.useEffect(() => {
        getRate();
    }, [getRate]);
    return (
        <>
            <SimpleGrid columns={{ base: 1, lg: 3 }} mt="50px" spacing="10px">
                {packages.map((pk: IPackage, index) => (
                    <InvestCard
                        pak={pk}
                        key={String(index)}
                        isBuying={isProcessing && pak?.key === pk.key}
                        rate={
                            pk.token === EToken.BNB
                                ? rate.bnbRate
                                : rate.usdtRate
                        }
                        walletInfo={wallet}
                        onBuy={() => handleBuyIco(pk)}
                    />
                ))}
            </SimpleGrid>
            <SuccessModal
                isOpen={isOpen}
                onClose={onClose}
                hash={txHash}
                title="Buy ICO"
            />
        </>
    );
}
