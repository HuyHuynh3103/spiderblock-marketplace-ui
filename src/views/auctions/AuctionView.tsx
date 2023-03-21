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
import FlopContract from "@/contracts/FlopContract";

export default function AuctionView() {
    const toast = useToast();
    const { data: signer } = useSigner({ chainId: getChainIdFromEnv() });
    const { address } = useAccount();
    const [nfts, setNfts] = React.useState<IAuctionInfo[]>([]);
    const [nftSelected, setNftSelected] = React.useState<IAuctionInfo>();
    const [isOpen, setIsOpen] = useBoolean();
    const [isAuctionSuccess, setIsAuctionSuccess] =
        React.useState<boolean>(false);

    const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
    const [txHash, setTxHash] = React.useState<string>();

    const getListAuctions = React.useCallback(async () => {
        const auctionContract = new AuctionContract();
        const nfts = await auctionContract.getAuctionActive();
        const nftContract = new NftContract();
        const auctionItems = await nftContract.getNftAuctionInfo(nfts);
        setNfts(auctionItems);
    }, []);

    React.useEffect(() => {
        getListAuctions();
    }, [getListAuctions]);

    const handleAuction = async (bid: number) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        if (!nftSelected) return;
        setIsProcessing(true);
        try {
            const auctionContract = new AuctionContract(signer);
            const flopContract = new FlopContract(signer);
            await flopContract.approve(auctionContract._contractAddress, bid);
            const tx = await auctionContract.joinAuction(
                nftSelected.auctionId,
                bid
            );
            setTxHash(tx);
            setIsAuctionSuccess(true);
            setIsOpen.off();
            await getListAuctions();
        } catch (ex: any) {
            setIsAuctionSuccess(false);
        }
        setIsProcessing(false);
    };

    return (
        <Flex w="full">
            <SimpleGrid columns={4} spacing="20px">
                {nfts.map((nft) => (
                    <NftAuction
                        item={nft}
                        key={nft.id}
                        onAction={() => {
                            setNftSelected(nft);
                            setIsOpen.on();
                        }}
                    />
                ))}
            </SimpleGrid>

            <AuctionModal
                isOpen={isOpen}
                isProcessing={isProcessing}
                nft={nftSelected}
                onClose={() => setIsOpen.off()}
                onAuction={(amount) => handleAuction(amount)}
            />

            <SuccessModal
                hash={txHash}
                isOpen={isAuctionSuccess}
                onClose={() => setIsAuctionSuccess(false)}
            />
        </Flex>
    );
}
