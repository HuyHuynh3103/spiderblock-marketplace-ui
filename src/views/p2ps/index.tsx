import { SuccessModal } from "@/components";
import Empty from "@/components/Empty";
import SpiderBlockTokenContract from "@/contracts/SpiderBlockTokenContract";
import MarketContract from "@/contracts/MarketContract";
import NftContract from "@/contracts/NftContract";
import getChainIdFromEnv from "@/contracts/utils/common";
import { getToast } from "@/utils";
import { INftItem } from "@/_types_";
import { SimpleGrid, useDisclosure, useToast, Flex } from "@chakra-ui/react";
import React from "react";
import { useAccount, useSigner } from "wagmi";
import NftP2P from "./components/NftP2P";

export default function P2PView() {
    const { data: signer } = useSigner({ chainId: getChainIdFromEnv() });

    const { address } = useAccount();
    const toast = useToast();
    const [currentNft, setCurrentNft] = React.useState<INftItem>();
    const [txHash, setTxHash] = React.useState<string>();
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [nfts, setNfts] = React.useState<INftItem[]>([]);
    const [symbol, setSymbol] = React.useState<string>("");
    const getSymbol = React.useCallback(async () => {
        const spiderBlockContract = new SpiderBlockTokenContract();
        const symbol = await spiderBlockContract.symbol();
        setSymbol(symbol);
    }, []);
    React.useEffect(() => {
        getSymbol();
    }, [getSymbol]);
    const getListedNfts = React.useCallback(async () => {
        try {
            const marketContract = new MarketContract();
            const nftContract = new NftContract();
            const listedItem = await marketContract.getNFTListedOnMarketplace();

            const nftListed = await nftContract.getNftInfo(listedItem);
            setNfts(nftListed);
        } catch (error: any) {
            toast(getToast(error.reason || error.message));
        }
    }, []);
    const handleBuy = async (nft: INftItem) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        if (!nft.price) return;
        try {
            setCurrentNft(nft);
            const marketContract = new MarketContract(signer);
            const spiderBlockContract = new SpiderBlockTokenContract(signer);
            await spiderBlockContract.approve(
                marketContract._contractAddress,
                nft.price
            );
            const tx = await marketContract.buyNft(nft.id, nft.price);
            setTxHash(tx);
            onOpen();
        } catch (error: any) {
            toast(getToast(error.reason || error.message));
        }
        setCurrentNft(undefined);
    };
    React.useEffect(() => {
        getListedNfts();
    }, [getListedNfts]);

    return (
        <Flex w="full" p={{ lg: "30px 20px" }}>
            {nfts.length === 0 ? (
                <Empty text="There are no nfts in marketplace" />
            ) : (
                <SimpleGrid
                    h="full"
                    columns={{ base: 1, md: 2, lg: 3 }}
                    spacing={10}
                >
                    {nfts.map((nft) => (
                        <NftP2P
                            symbol={symbol}
                            key={nft.id}
                            item={nft}
                            isDisabled={!address}
                            isBuying={currentNft?.id === nft.id}
                            onAction={() => handleBuy(nft)}
                        />
                    ))}
                </SimpleGrid>
            )}
            <SuccessModal
                title="BUY NFT"
                hash={txHash}
                isOpen={isOpen}
                onClose={onClose}
            />
        </Flex>
    );
}
