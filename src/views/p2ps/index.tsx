import { SuccessModal } from "@/components";
import FlopContract from "@/contracts/FlopContract";
import MarketContract from "@/contracts/MarketContract";
import NftContract from "@/contracts/NftContract";
import { useAppSelector } from "@/reduxs/hooks";
import { getToast } from "@/utils";
import { INftItem } from "@/_types_";
import { SimpleGrid, useDisclosure, useToast } from "@chakra-ui/react";
import React from "react";
import NftP2P from "./components/NftP2P";

export default function P2PView() {
    const { web3Provider, wallet } = useAppSelector((state) => state.account);
    const toast = useToast();
    const [currentNft, setCurrentNft] = React.useState<INftItem>();
    const [txHash, setTxHash] = React.useState<string>();
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [nfts, setNfts] = React.useState<INftItem[]>([]);
    const getListedNfts = React.useCallback(async () => {
        try {
            const marketContract = new MarketContract();
            const nftContract = new NftContract();
            const listedItem = await marketContract.getNFTListedOnMarketplace();
            const nftListed = await nftContract.getNftInfo(listedItem);
            setNfts(nftListed);
        } catch (error) {
            console.log("Error", error);
        }
    }, []);
    const handleBuy = React.useCallback(async (nft: INftItem) => {
        if (!web3Provider || !nft.price) return;
        try {
            setCurrentNft(nft);
            const marketContract = new MarketContract(web3Provider);
            const iptContract = new FlopContract(web3Provider);
            await iptContract.approve(
                marketContract._contractAddress,
                nft.price
            );
            const tx = await marketContract.buyNft(nft.id, nft.price);
            setTxHash(tx);
            onOpen();
        } catch (er: any) {
            toast(getToast(er));
        }
        setCurrentNft(undefined);
    }, []);
    React.useEffect(() => {
        getListedNfts();
    }, [getListedNfts]);

    return (
        <>
            <SimpleGrid column={4} spacing="20px">
                {nfts.map((nft) => (
                    <NftP2P
                        item={nft}
                        key={nft.id}
                        isDisabled={!wallet}
                        isBuying={currentNft?.id === nft.id}
                        onAction={() => handleBuy(nft)}
                    />
                ))}
            </SimpleGrid>
            <SuccessModal
                title="BUY NFT"
                hash={txHash}
                isOpen={isOpen}
                onClose={onClose}
            />
        </>
    );
}
