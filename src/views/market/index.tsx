import { ProcessingModal, SuccessModal } from "@/components";
import Empty from "@/components/Empty";
import AuctionContract from "@/contracts/AuctionContract";
import MarketContract from "@/contracts/MarketContract";
import NftContract from "@/contracts/NftContract";
import SpiderBlockTokenContract from "@/contracts/SpiderBlockTokenContract";
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
import { getTime, getUnixTime } from "date-fns";
import React from "react";
import { useAccount, useSigner } from "wagmi";
import NftAuction from "../auctions/components/NftAuction";
import AuctionModal from "./components/AuctionModal";
import ListModal from "./components/ListModal";
import Nft from "./components/Nft";
import TransferModal from "./components/TransferModal";

export default function CollectionView() {
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
    const [symbol, setSymbol] = React.useState<string>("");
    const getSymbol = React.useCallback(async () => {
        const spiderBlockContract = new SpiderBlockTokenContract();
        const symbol = await spiderBlockContract.symbol();
        setSymbol(symbol);
    }, []);
    React.useEffect(() => {
        getSymbol();
    }, [getSymbol]);
    const {
        isOpen: isSuccess,
        onClose: onCloseSuccess,
        onOpen: onOpenSuccess,
    } = useDisclosure();
    const getListNft = React.useCallback(async () => {
        if (address) {
            try {
                console.log("getlist");
                const nftContract = new NftContract();
                const marketContract = new MarketContract();
                const nfts = await nftContract.getListNfts(address);
                console.log("Listed NFTs", address);
                setNfts(nfts.filter((nft) => nft.name));
                const nftItems =
                    await marketContract.getNFTListedOnMarketplace();
                const listedNfts = await nftContract.getNftInfo(nftItems);
                setNftsListed(listedNfts);
                const auctionContract = new AuctionContract();
                const auctionNfts = await auctionContract.getAuctionActive();
                console.log("auction", auctionNfts);
                const myAuctions = auctionNfts.filter(
                    (p) => p.auctioneer === address
                );
                console.log("myAuctions", myAuctions);
                const nftAuctions = await nftContract.getNftAuctionInfo(
                    myAuctions
                );
                setAuctions(nftAuctions);
            } catch (error: any) {
                console.log("get list nft failed", error);
                toast(getToast(error.reason || error.message));
            }
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
            setOpenTransferModal.off();
            await getListNft();
        } catch (err: any) {
            toast(getToast(err.reason || err.message));
        }
        setIsProcessing.off();
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
            onOpenSuccess();
            await getListNft();
        } catch (err: any) {
            setIsProcessing.off();
            toast(getToast(err.reason || err.message));
        }
        setIsProcessing.off();
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
        } catch (err: any) {
            toast(getToast(err.reason || err.message));
        }
    };
    const handleCancelAuction = async (item: IAuctionInfo) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        try {
            const auctionContract = new AuctionContract(signer);
            const tx = await auctionContract.cancelAuction(item.auctionId);
            setTxHash(tx);
            onOpenSuccess();
            await getListNft();
        } catch (err: any) {
            toast(getToast(err.reason || err.message));
        }
    };
    const handleCreateAuction = async (price: number, endTime: Date) => {
        if (!signer) {
            toast(getToast("Please connect wallet first", "info", "Info"));
            return;
        }
        if (!nftSelected) return;
        setIsProcessing.on();
        try {
            const nftContract = new NftContract(signer);
            const auctionContract = new AuctionContract(signer);
            await nftContract.approve(
                auctionContract._contractAddress,
                nftSelected.id
            );
            const block = await signer.provider?.getBlock("latest");
            console.log("block", block);
            if (!block) {
                throw new Error("Can not get block");
            }
            const startTimestamp = block?.timestamp + 60;
            const endTimestamp = getUnixTime(endTime);
            if (startTimestamp > endTimestamp) {
                throw new Error("Start time must be less than end time");
            }
            console.log("startTimestamp", startTimestamp);
            console.log("endTimestamp", endTimestamp);

            const tx = await auctionContract.createAuction(
                nftSelected.id,
                price,
                startTimestamp,
                endTimestamp
            );
            setTxHash(tx);
            onOpenSuccess();
            setNftSelected(undefined);
            setOpenTransferModal.off();
            await getListNft();
        } catch (err: any) {
            console.error(err);
            toast(getToast(err.reason || err.message));
        }
        setIsProcessing.off();
    };

    return (
        <Flex w="full" p={{ lg: "30px 20px" }}>
            <Tabs w="full" align="center">
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
                        {nfts.length == 0 ? (
                            <Empty text="No NFTs Found" />
                        ) : (
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
                        )}
                    </TabPanel>

                    <TabPanel>
                        {nftsListed.length == 0 ? (
                            <Empty text="No NFTs Listed" />
                        ) : (
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
                        )}
                    </TabPanel>

                    <TabPanel>
                        {auctions.length == 0 ? (
                            <Empty text="No Auction Found" />
                        ) : (
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
                                        onAction={() =>
                                            handleCancelAuction(nft)
                                        }
                                    />
                                ))}
                            </SimpleGrid>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <ProcessingModal isOpen={isUnList} onClose={() => {}} />
            <ListModal
                symbol={symbol}
                isOpen={isOpenListing}
                nft={nftSelected}
                isListing={isProcessing}
                onClose={() => setIsOpenListing.off()}
                onList={(amount) => handleListNft(amount)}
            />
            <AuctionModal
                symbol={symbol}
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
