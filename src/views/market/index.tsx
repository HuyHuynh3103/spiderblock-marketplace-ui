import { ProcessingModal, SuccessModal } from "@/components";
import AuctionContract from "@/contracts/AuctionContract";
import MarketContract from "@/contracts/MarketContract";
import NftContract from "@/contracts/NftContract";
import getChainIdFromEnv from "@/contracts/utils/common";
import { getToast } from "@/utils";
import { ActionType, IAuctionInfo, INftItem } from "@/_types_";
import {
    Flex,
    SimpleGrid,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useBoolean,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import React from "react";
import { useAccount, useSigner } from "wagmi";
import NftAuction from "../auctions/components/NftAuction";
import AuctionModal from "./components/AuctionModal";
import ListModal from "./components/ListModal";
import Nft from "./components/Nft";
import TransferModal from "./components/TransferModal";

export default function MarketView() {
    const toast = useToast();
    const { data: signer } = useSigner({ chainId: getChainIdFromEnv() });
    const { address } = useAccount();
    const [nfts, setNfts] = React.useState<INftItem[]>([]);
    const [nftsListed, setNftsListed] = React.useState<INftItem[]>([]);
    const [nftSelected, setNftSelected] = React.useState<INftItem>();
    const [auctions, setAuctions] = React.useState<IAuctionInfo[]>([]);
    const [isOpenListing, setIsOpenListing] = useBoolean();
    const [isUnList, setIsUnList] = useBoolean();
    const [txHash, setTxHash] = React.useState<string>();
    const [isOpenTransferModal, setOpenTransferModal] = useBoolean();
    const [isProcessing, setIsProcessing] = useBoolean();
    const [isOpenAuction, setIsOpenAuction] = useBoolean();
    const {
        isOpen: isSuccess,
        onClose: onCloseSuccess,
        onOpen: onOpenSuccess,
    } = useDisclosure();
    const getListNft = React.useCallback(async () => {
        if (address) {
            console.log("getlist");
            const nftContract = new NftContract();
            const marketContract = new MarketContract();
            const nfts = await nftContract.getListNfts(address);
            setNfts(nfts.filter((nft) => nft.name));
            const nftItems = await marketContract.getNFTListedOnMarketplace();
            const listedNfts = await nftContract.getNftInfo(nftItems);
            setNftsListed(listedNfts);

            const auctionContract = new AuctionContract();
            const auctionNfts = await auctionContract.getAuctionActive();
            console.log(auctionNfts);
            const myAuctions = auctionNfts.filter(
                (p) => p.auctioneer === address
            );
            const nftAuctions = await nftContract.getNftAuctionInfo(myAuctions);
            setAuctions(nftAuctions);
        } else {
            setNfts([]);
            setNftsListed([]);
            setAuctions([]);
        }
    }, [address]);

    React.useEffect(() => {
        getListNft();
    }, [getListNft]);

    const selectAction = async (ac: ActionType, item: INftItem) => {
        if (!signer) return;
        setNftSelected(item);
        setIsProcessing.off();
        switch (ac) {
            case "LIST":
                setIsOpenListing.on();
                break;
            case "UNLIST":
                setIsUnList.on();
                handleUnList(item);
                break;
            case "TRANSFER":
                setOpenTransferModal.on();
                break;
            case "AUCTION": {
                setIsOpenAuction.on();
                break;
            }
            default:
                break;
        }
    };
    const handleListNft = async (price?: number) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        if (!price || !address || !nftSelected) return;
        setIsProcessing.on();
        try {
            const nftContract = new NftContract(signer);
            const marketContract = new MarketContract(signer);
            await nftContract.approve(
                marketContract._contractAddress,
                nftSelected.id
            );
            const tx = await marketContract.listNft(nftSelected.id, price);
            setTxHash(tx);
            onOpenSuccess();
            setNftSelected(undefined);
            setIsProcessing.off();
            setOpenTransferModal.off();
            await getListNft();
        } catch (er: any) {
            console.error(er);
            setIsProcessing.off();
            toast(getToast(er));
        }
    };
    const handleTransfer = async (addressTo: string) => {
        setIsProcessing.on();
        try {
            if (!signer) {
                toast(getToast("Please connect wallet first", "info", "Info"));
                return;
            }
            if (!nftSelected || !address) return;
            const nftContract = new NftContract(signer);
            const tx = await nftContract.safeTransferFrom(
                address,
                addressTo,
                nftSelected.id
            );
            console.log("tx");
            setTxHash(tx);
            setOpenTransferModal.off();
            setIsProcessing.off();
            onOpenSuccess();
            await getListNft();
        } catch (error: any) {
            console.error(error);
            setIsProcessing.off();
            toast(getToast(error));
        }
    };
    const handleUnList = async (item: INftItem) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        if (!nftSelected) return;
        try {
            const marketContract = new MarketContract(signer);
            const tx = await marketContract.unListNft(item.id);
            setTxHash(tx);
            setNftSelected(undefined);
            setIsUnList.off();
            onOpenSuccess();
            await getListNft();
        } catch (error: any) {
            console.error(error);
            toast(getToast(error));
        }
    };
    const handleCancelAuction = async (item: IAuctionInfo) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        try {
            const auctionContract = new AuctionContract(signer);
            const tx = await auctionContract.cancelAuction(item.id);
            setTxHash(tx);
            onOpenSuccess();
            await getListNft();
        } catch (error: any) {
            console.error(error);
            toast(getToast(error));
        }
    };
    const handleCreateAuction = async (price: number, endTime: Date) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        if (!nftSelected) return;
        try {
            const nftContract = new NftContract(signer);
            const auctionContract = new AuctionContract(signer);
            await nftContract.approve(
                auctionContract._contractAddress,
                nftSelected.id
            );
            const startTimestamp = Math.floor(Date.now());
            const endTimestamp = endTime.getTime();
            const tx = await auctionContract.createAuction(
                nftSelected.id,
                price,
                startTimestamp,
                endTimestamp
            );
            setTxHash(tx);
            onOpenSuccess();
            setNftSelected(undefined);
            setIsProcessing.off();
            setOpenTransferModal.off();
            await getListNft();
        } catch (er: any) {
            console.error(er);
            setIsProcessing.off();
            toast(getToast(er));
        }
    };

    return (
        <Flex w="full">
            <Tabs>
                <TabList
                    borderBottomColor="#5A5A5A"
                    borderBottomRadius={2}
                    mx="15px"
                >
                    <Tab
                        textTransform="uppercase"
                        color="#5A5A5A"
                        _selected={{
                            borderBottomColor: "white",
                            color: "white",
                        }}
                    >
                        my collection
                    </Tab>
                    <Tab
                        textTransform="uppercase"
                        color="#5A5A5A"
                        _selected={{
                            borderBottomColor: "white",
                            color: "white",
                        }}
                    >
                        active listings
                    </Tab>
                    <Tab
                        textTransform="uppercase"
                        color="#5A5A5A"
                        _selected={{
                            borderBottomColor: "white",
                            color: "white",
                        }}
                    >
                        live auctions
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <SimpleGrid
                            w="full"
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={10}
                        >
                            {nfts.map((nft, index) => (
                                <Nft
                                    item={nft}
                                    key={index}
                                    index={index}
                                    isAuction
                                    isList
                                    isTransfer
                                    onAction={(a) => selectAction(a, nft)}
                                />
                            ))}
                        </SimpleGrid>
                    </TabPanel>

                    <TabPanel>
                        <SimpleGrid
                            w="full"
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={10}
                        >
                            {nftsListed.map((nft, index) => (
                                <Nft
                                    item={nft}
                                    key={index}
                                    index={index}
                                    isUnList
                                    onAction={(a) => selectAction(a, nft)}
                                />
                            ))}
                        </SimpleGrid>
                    </TabPanel>

                    <TabPanel>
                        <SimpleGrid
                            w="full"
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={10}
                        >
                            {auctions.map((nft, index) => (
                                <NftAuction
                                    item={nft}
                                    key={index}
                                    isCancel
                                    onAction={() => handleCancelAuction(nft)}
                                />
                            ))}
                        </SimpleGrid>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <ProcessingModal isOpen={isUnList} onClose={() => {}} />
            <ListModal
                isOpen={isOpenListing}
                nft={nftSelected}
                isListing={isProcessing}
                onClose={() => setIsOpenListing.off()}
                onList={(amount) => handleListNft(amount)}
            />
            <AuctionModal
                isOpen={isOpenAuction}
                nft={nftSelected}
                isProcessing={isProcessing}
                onClose={() => setIsOpenAuction.off()}
                onAuction={(price, endTime) => {
                    if (price && endTime) {
                        handleCreateAuction(price, endTime);
                    }
                }}
            />

            <TransferModal
                isOpen={isOpenTransferModal}
                nft={nftSelected}
                isTransfer={isProcessing}
                onClose={() => setOpenTransferModal.off()}
                onTransfer={(toAddress) => handleTransfer(toAddress)}
            />

            <SuccessModal
                hash={txHash}
                title="SUCCESS"
                isOpen={isSuccess}
                onClose={onCloseSuccess}
            />
        </Flex>
    );
}
