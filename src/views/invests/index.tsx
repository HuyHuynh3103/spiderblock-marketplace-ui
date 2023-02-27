declare var window: any;
import { ConnectWallet, WalletInfo } from "@/src/components";
import InvestCard from "@/src/components/InvestCard";
import { packages } from "@/src/constants";
import { EToken, IPackage, IRate, IWalletInfo } from "@/src/_types_";
import { Flex, Heading, SimpleGrid, Spacer } from "@chakra-ui/react";
import { ethers } from "ethers";
import React from "react";

export default function InvestView() {
    const [wallet, setWallet] = React.useState<IWalletInfo>();
    const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
    const [rate, setRate] = React.useState<IRate>({bnbRate: 0, usdtRate: 0});
	
	const [web3Provider, setWeb3Provider] = React.useState<ethers.providers.Web3Provider>();
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
            const nativeBalance = Number.parseFloat(ethers.utils.formatEther(bigBalance));
			setWeb3Provider(provider)
			setWallet({
				address,
				nativeAmt: nativeBalance
			})
        }
    };
	const handleBuyIco = (pak: IPackage) => {

	}
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
				{
					!wallet ? (
						<ConnectWallet onClick={onConnectMetamask} />
					) : (
						<WalletInfo
							address={wallet?.address}
							amount={wallet?.nativeAmt || 0}
						/>
					)
				}
            </Flex>
			<SimpleGrid columns={{base: 1, lg: 3}} mt="50px" spacingY="20px">
				{packages.map((pk: IPackage, index) => 
				<InvestCard 
					pak={pk}
					key={String(index)}
					isBuying={isProcessing && pk?.key === pk.key}
					rate={pk.token === EToken.BNB ? rate.bnbRate : rate.usdtRate}
					walletInfo={wallet}
					onBuy={()=>handleBuyIco(pk)}
				/>
				)}
			</SimpleGrid>
        </Flex>
    );
}
