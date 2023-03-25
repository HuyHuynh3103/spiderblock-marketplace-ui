import React from "react";
import NftContract from "@/contracts/NftContract";
import { IAuctionInfo } from "@/_types_";
import { Flex, SimpleGrid, useBoolean, useToast } from "@chakra-ui/react";
import NftAuction from "./components/NftAuction";
import AuctionModal from "./components/AuctionModal";
import AuctionContract from "@/contracts/AuctionContract";
import { SuccessModal } from "@/components";
import { useAccount, useSigner } from "wagmi";
import { getToast } from "@/utils";
import getChainIdFromEnv from "@/contracts/utils/common";
import SpiderBlockTokenContract from "@/contracts/SpiderBlockTokenContract";
import Empty from "@/components/Empty";

export default function AuctionView() {
    const toast = useToast();
    const { data: signer } = useSigner({ chainId: getChainIdFromEnv() });
    const [auctions, setAuctions] = React.useState<IAuctionInfo[]>([]);
    const [auctionSelected, setAuctionSelected] =
        React.useState<IAuctionInfo>();
    const [isOpen, setIsOpen] = useBoolean();
    const [isAuctionSuccess, setIsAuctionSuccess] = useBoolean();

    const [isProcessing, setIsProcessing] = useBoolean();
    const [txHash, setTxHash] = React.useState<string>();
    const [symbol, setSymbol] = React.useState<string>("");
    const getSymbol = React.useCallback(async () => {
        const spiderBlockContract = new SpiderBlockTokenContract();
        const symbol = await spiderBlockContract.symbol();
        setSymbol(symbol);
    }, []);
    React.useEffect(() => {
        getSymbol();
    }, [getSymbol]);

    const getListAuctions = React.useCallback(async () => {
        const auctionContract = new AuctionContract();
        const nfts = await auctionContract.getAuctionActive();
        const nftContract = new NftContract();
        const auctionItems = await nftContract.getNftAuctionInfo(nfts);
        console.log(auctionItems);
        setAuctions(auctionItems);
    }, []);

    React.useEffect(() => {
        getListAuctions();
    }, [getListAuctions]);

    const handleAuction = async (bid: number) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        if (!auctionSelected) return;
        setIsProcessing.on();
        try {
            const auctionContract = new AuctionContract(signer);
            const spiderBlockContract = new SpiderBlockTokenContract(signer);
            await spiderBlockContract.approve(
                auctionContract._contractAddress,
                bid
            );
            const tx = await auctionContract.joinAuction(
                auctionSelected.auctionId,
                bid
            );
            setTxHash(tx);
            setIsAuctionSuccess.on();
            await getListAuctions();
        } catch (ex: any) {
            toast(getToast(ex.reason || ex.message));
        }
        setIsAuctionSuccess.off();
        setIsProcessing.off();
        setIsOpen.off();
    };

    return (
        <Flex w="full" p={{ lg: "30px 20px" }}>
            {auctions.length === 0 ? (
                <Empty text="There are no auction openning now" />
            ) : (
                <SimpleGrid
                    w="full"
                    columns={{ base: 1, md: 2, lg: 3 }}
                    spacing={10}
                >
                    {auctions.map((nft) => (
                        <NftAuction
                            item={nft}
                            key={nft.id}
                            onAction={() => {
                                setAuctionSelected(nft);
                                setIsOpen.on();
                            }}
                        />
                    ))}
                </SimpleGrid>
            )}

            <AuctionModal
                symbol={symbol}
                isOpen={isOpen}
                isProcessing={isProcessing}
                auction={auctionSelected}
                onClose={() => setIsOpen.off()}
                onAuction={(amount) => handleAuction(amount)}
            />

            <SuccessModal
                hash={txHash}
                isOpen={isAuctionSuccess}
                onClose={() => setIsAuctionSuccess.off()}
            />
        </Flex>
    );
}
