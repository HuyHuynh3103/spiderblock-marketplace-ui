import { SuccessModal } from "@/components";
import FlopContract from "@/contracts/FlopContract";
import MarketContract from "@/contracts/MarketContract";
import NftContract from "@/contracts/NftContract";
import getChainIdFromEnv from "@/contracts/utils/common";
import { getToast } from "@/utils";
import { INftItem } from "@/_types_";
import { SimpleGrid, useDisclosure, useToast } from "@chakra-ui/react";
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
        if (!signer || !nft.price) return;
        try {
            setCurrentNft(nft);
            const marketContract = new MarketContract(signer);
            const iptContract = new FlopContract(signer);
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
            <SimpleGrid
                w="full"
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={10}
            >
                {nfts.map((nft) => (
                    <NftP2P
                        key={nft.id}
                        item={nft}
                        isDisabled={!address}
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
