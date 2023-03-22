import { SuccessModal } from "@/components";
import { packages } from "@/constants";
import CrowSaleContract from "@/contracts/CrowdSaleContract";
import SpiderBlockTokenContract from "@/contracts/SpiderBlockTokenContract";
import UsdtContract from "@/contracts/UsdtContract";
import getChainIdFromEnv from "@/contracts/utils/common";
import { getToast } from "@/utils";
import { EToken, IPackage, IWalletInfo } from "@/_types_";
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
    const [txHash, setTxHash] = React.useState<string>();
    const { isOpen, onOpen, onClose } = useDisclosure();
	const [symbol, setSymbol] = React.useState<string>("");
	const getSymbol = React.useCallback(async () => {
		const spiderBlockContract = new SpiderBlockTokenContract();
		const symbol = await spiderBlockContract.symbol();
		setSymbol(symbol);
	}, []);
    React.useEffect(() => {
        getSymbol();
    }, [getSymbol]);
    const handleBuyIco = async (pak: IPackage, paymentAmount: number) => {
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
                    hash = await crowdContract.buyTokenByNative(paymentAmount);
                    break;
                case EToken.USDT:
                    const usdtContract = new UsdtContract(signer);
                    await usdtContract.approve(
                        crowdContract._contractAddress,
                        paymentAmount
                    );
                    hash = await crowdContract.buyTokenByErc20(paymentAmount);
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
						symbol={symbol}
                        pak={pk}
                        key={String(index)}
                        isBuying={isProcessing && pak?.key === pk.key}
                        walletInfo={wallet}
                        onBuy={(paymentAmount: number) => handleBuyIco(pk, paymentAmount)}
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
