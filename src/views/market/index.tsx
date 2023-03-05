import { ProcessingModal, SuccessModal } from "@/components";
import MarketContract from "@/contracts/MarketContract";
import NftContract from "@/contracts/NftContract";
import { useAppSelector } from "@/reduxs/hooks";
import { ActionType, INftItem } from "@/_types_";
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
} from "@chakra-ui/react";
import React from "react";
import ListModal from "./components/ListModal";
import Nft from "./components/Nft";
import TransferModal from "./components/TransferModal";

export default function MarketView() {
    const { web3Provider, wallet } = useAppSelector(
        (state: any) => state.account
    );
    const [nfts, setNfts] = React.useState<INftItem[]>([]);
    const [nftsListed, setNftsListed] = React.useState<INftItem[]>([]);
    const [nftSelected, setNftSelected] = React.useState<INftItem>();
    const [action, setAction] = React.useState<ActionType>();
    const [isListing, setIsListing] = useBoolean();
    const [isOpen, setIsOpen] = useBoolean();
    const [isUnList, setIsUnList] = useBoolean();
    const [txHash, setTxHash] = React.useState<string>();
    const [isOpenTransferModal, setOpenTransferModal] = useBoolean();
    const [isProcessing, setIsProcessing] = useBoolean();
    const {
        isOpen: isSuccess,
        onClose: onCloseSuccess,
        onOpen: onOpenSuccess,
    } = useDisclosure();
    const getListNft = React.useCallback(async () => {
        if (!web3Provider || !wallet) return;
        console.log("getlist");
        const nftContract = new NftContract(web3Provider);
        const marketContract = new MarketContract(web3Provider);
        const nfts = await nftContract.getListNfts(wallet.address);
        console.log(nfts);
        setNfts(nfts.filter((nft) => nft.name));
        const nftItems = await marketContract.getNFTListedOnMarketplace();
        console.log(nftItems);
        const listedNfts = await nftContract.getNftInfo(nftItems);
        setNftsListed(listedNfts);
    }, [web3Provider, wallet]);

    React.useEffect(() => {
        getListNft();
    }, [getListNft]);

    const selectAction = async (ac: ActionType, item: INftItem) => {
        if (
            (ac !== "LIST" &&
                ac !== "UNLIST" &&
                ac !== "TRANSFER" &&
                ac !== "AUCTION") ||
            !web3Provider
        )
            return;
        setNftSelected(item);
        setAction(ac);
        setIsListing.off();
        switch (ac) {
            case "LIST":
                setIsOpen.on();
                break;
            case "UNLIST":
                setIsUnList.on();
                const marketContract = new MarketContract(web3Provider);
                const tx = await marketContract.unListNft(item.id);
                setTxHash(tx);
                setAction(undefined);
                setNftSelected(undefined);
                setIsUnList.off();
                onOpenSuccess();
                await getListNft();
                break;
            case "TRANSFER":
                setOpenTransferModal.on();
                break;
            case "AUCTION":
                break;
            default:
                break;
        }
    };
    const handleListNft = async (price?: number) => {
        if (!price || !web3Provider || !wallet || !nftSelected) return;
        setIsListing.on();
        try {
            const nftContract = new NftContract(web3Provider);
            const marketContract = new MarketContract(web3Provider);
            await nftContract.approve(
                marketContract._contractAddress,
                nftSelected.id
            );
            console.log();
            const tx = await marketContract.listNft(nftSelected.id, price);
            setTxHash(tx);
            onOpenSuccess();
            setAction(undefined);
            setNftSelected(undefined);
            setOpenTransferModal.off();
            await getListNft();
        } catch (er: any) {
            console.error(er);
        }
    };
    const handleTransfer = async (addressTo: string) => {
        setIsProcessing.on();
        try {
            if (!web3Provider || !nftSelected || !wallet) return;
            const nftContract = new NftContract(web3Provider);
            const tx = await nftContract.safeTransferFrom(
                wallet.address,
                addressTo,
                nftSelected.id
            );
            console.log("tx");
            setTxHash(tx);
            setOpenTransferModal.off();
            onOpenSuccess();
            await getListNft();
        } catch (error) {
			console.error(error)
		}
        setIsProcessing.off();
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
                        <SimpleGrid w="full" columns={4} spacing={10}>
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
                        <SimpleGrid w="full" columns={4} spacing={10}>
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
                        <SimpleGrid w="full" columns={4} spacing={10}>
                            {/* {auctions.map((nft, index) => (
                <NftAuction
                  item={nft}
                  key={index}
                  isCancel
                  onAction={async (a) => {
                    setIsUnList.on();
                    try {
                      const auctionContract = new AuctionContract(web3Provider);
                      const tx = await auctionContract.cancelAuction(
                        nft.auctionId
                      );
                      setTxHash(tx);
                      onOpenSuccess();
                      await getListNft();
                    } catch (ex) {
                      console.log(ex);
                    }
                    setIsUnList.off();
                  }}
                />
              ))} */}
                        </SimpleGrid>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <ProcessingModal isOpen={isUnList} onClose={() => {}} />
            <ListModal
                type="LISTING"
                isOpen={isOpen}
                nft={nftSelected}
                isListing={isListing}
                onClose={() => setIsOpen.off()}
                onList={(amount) => handleListNft(amount)}
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
