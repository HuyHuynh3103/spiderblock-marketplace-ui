import MarketContract from '@/contracts/MarketContract';
import NftContract from '@/contracts/NftContract';
import { useAppSelector } from '@/reduxs/hooks'
import { INftItem } from '@/_types_';
import { Flex, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react'
import Nft from './components/Nft';

export default function MarketView() {
  const {web3Provider, wallet} = useAppSelector((state:any) => state.account);
  const [nfts, setNfts] = React.useState<INftItem[]>([]);
  const [nftsListed, setNftsListed] = React.useState<INftItem[]>([]);
  const getListNft = React.useCallback(async()=>{
	if (!web3Provider || !wallet) return;
	console.log('getlist')
	const nftContract = new NftContract(web3Provider);
	const marketContract = new MarketContract(web3Provider);
	const nfts = await nftContract.getListNfts(wallet.address);
	console.log(nfts)
	setNfts(nfts.filter(nft => nft.name));
	const ids = await marketContract.getNFTListedOnMarketplace();
	const listedNfts = await nftContract.getNftInfo(ids);
	setNftsListed(listedNfts);
  }, [web3Provider, wallet])
  
  React.useEffect(()=>{
	getListNft();
  }, [getListNft])
  
  return (
	<Flex w="full">
      <Tabs>
        <TabList borderBottomColor="#5A5A5A" borderBottomRadius={2} mx="15px">
          <Tab
            textTransform="uppercase"
            color="#5A5A5A"
            _selected={{ borderBottomColor: "white", color: "white" }}
          >
            items
          </Tab>
          <Tab
            textTransform="uppercase"
            color="#5A5A5A"
            _selected={{ borderBottomColor: "white", color: "white" }}
          >
            active listings
          </Tab>
          <Tab
            textTransform="uppercase"
            color="#5A5A5A"
            _selected={{ borderBottomColor: "white", color: "white" }}
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
                //   onAction={(a) => selectAction(a, nft)}
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
                //   onAction={(a) => selectAction(a, nft)}
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

      {/* <ProcessingModal isOpen={isUnlist} onClose={() => {}} />
      <ListModal
        type={modalType}
        isOpen={isOpen}
        nft={nft}
        isListing={isProcessing}
        onClose={() => setIsOpen.off()}
        onList={(amount, expireDate) => handleListNft(amount, expireDate)}
      />

      <TransferModal
        isOpen={isOpenTransferModal}
        nft={nft}
        isTransfer={isProcessing}
        onClose={() => setOpenTransferModal(false)}
        onTransfer={(toAddress) => handleTransfer(toAddress)}
      />

      <SuccessModal
        hash={txHash}
        title="SUCCESS"
        isOpen={isSuccess}
        onClose={onCloseSuccess}
      /> */}
    </Flex>
  )
}
