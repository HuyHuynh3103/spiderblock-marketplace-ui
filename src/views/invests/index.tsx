import { SuccessModal } from "@/components";
import { packages } from "@/constants";
import CrowSaleContract from "@/contracts/CrowdSaleContract";
import UsdtContract from "@/contracts/UsdtContract";
import getChainIdFromEnv from "@/contracts/utils/common";
import { getToast } from "@/utils";
import { EToken, IPackage, IRate, IWalletInfo } from "@/_types_";
import { SimpleGrid, useDisclosure, useToast } from "@chakra-ui/react";
import React from "react";
import { useAccount, useBalance, useSigner } from "wagmi";
import { InvestCard } from "./components";

export default function InvestView() {
    const toast = useToast();
    const [wallet, setWallet] = React.useState<IWalletInfo>();
    const { data: signer } = useSigner({ chainId: getChainIdFromEnv() });
    const { address } = useAccount();
    const { data: balanceData } = useBalance();
    const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
    const [pak, setPak] = React.useState<IPackage>();
    const [rate, setRate] = React.useState<IRate>({ bnbRate: 0, usdtRate: 0 });
    const [txHash, setTxHash] = React.useState<string>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const handleBuyIco = async (pak: IPackage) => {
        if (!signer) {
			toast(getToast("Please connect wallet first", "info", "Info"));
			return;
		}
        try {
            setPak(pak);
            setIsProcessing(true);
            let hash = "";
            const crowdContract = new CrowSaleContract(signer);
            switch (pak.token) {
                case EToken.BNB:
                    hash = await crowdContract.buyTokenByNative(pak.amount);
                    break;
                case EToken.USDT:
                    const usdtContract = new UsdtContract(signer);
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
            setPak(undefined);
            setIsProcessing(false);
        } catch (err: any) {
            toast(getToast(err.reason || err.message));
            setPak(undefined);
            setIsProcessing(false);
        }
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
    React.useEffect(() => {
        if (address && balanceData) {
            setWallet({
                address,
                nativeAmt: balanceData?.decimals,
            });
        }
    }, [balanceData, address]);
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
