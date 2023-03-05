import { getRPC } from './utils/common';
import { getMarketAbi } from "./utils/getAbis";
import { getMarketAddress } from "./utils/getAddress";
import { ethers } from "ethers";
import { BaseInterface } from "./interfaces";
import { ConversionHelper } from "./helper";

export default class MarketContract extends BaseInterface {
    constructor(provider?: ethers.providers.Web3Provider) {
		const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC())
        super(provider || rpcProvider, getMarketAddress(), getMarketAbi());
		if(!provider) {
			this._contract = new ethers.Contract(this._contractAddress, this._abis, rpcProvider);
		}
    }
    getNFTListedOnMarketplace = async () => {
        const items: any[] = await this._contract.getListedNft();
        const nfts = items.map((item: any) => {
            return {
                tokenId: ConversionHelper._toNumber(item.tokenId),
                author: item.author,
				price: ConversionHelper._toNumber(item.price)
            };
        });
        return nfts;
    };
    getMyNftListed = async (address: string) => {
        const nftsListed = await this.getNFTListedOnMarketplace();
        return nftsListed.filter(
            (nft) => nft.author?.toLowerCase() === address.toLowerCase()
        );
    };
    listNft = async (tokenId: number, price: number): Promise<string> => {
        const priceInEther = ConversionHelper._numberToEth(price);
        const tx = await this._contract.listNft(
            tokenId,
            priceInEther,
            this._option
        );
        return this._handleTransactionResponse(tx);
    };
    unListNft = async (tokenId: number) => {
        const tx = await this._contract.unlistNft(tokenId, this._option);
        return this._handleTransactionResponse(tx);
    };

	buyNft = async (tokenId: number, price:number) => {
		const wei = ConversionHelper._numberToEth(price);
		const tx = await this._contract.buyNft(tokenId, wei, this._option);
		return this._handleTransactionResponse(tx);
	}
}
