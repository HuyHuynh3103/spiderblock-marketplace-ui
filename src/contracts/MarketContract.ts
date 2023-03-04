import { getMarketAbi } from './utils/getAbis';
import { getMarketAddress } from './utils/getAddress';
import { ethers } from "ethers";
import { BaseInterface } from "./interfaces";
import { ConversionHelper } from './helper';

export default class MarketContract extends BaseInterface {
	constructor(provider: ethers.providers.Web3Provider){
		super(provider, getMarketAddress(), getMarketAbi())
	}
	getNFTListedOnMarketplace = async () => {
		const items:any[] = await this._contract.getListedNft();
		const nfts = items.map((item:any)=> ({tokenId: ConversionHelper._toNumber(item.tokenId), author: item.author}));
		return nfts
	}
	getMyNftListed = async(address: string) => {
		const nftsListed = await  this.getNFTListedOnMarketplace();
		return nftsListed.filter(nft => nft.author?.toLowerCase() === address.toLowerCase());
	}
	listNft = async(tokenId: number, price: number) : Promise<string> => {
		const priceInEther = ConversionHelper._numberToEth(price);
		const tx = await this._contract.listNft(tokenId, priceInEther, this._option);
		return this._handleTransactionResponse(tx)
	}
	unListNft = async(tokenId: number) => {
		const tx = await this._contract.unlistNft(tokenId, this._option);
		return this._handleTransactionResponse(tx);
	}
}