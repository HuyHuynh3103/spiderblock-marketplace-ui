import { getAuctionAbi } from "./utils/getAbis";
import { getAuctionAddress } from "./utils/getAddress";
import { ethers } from "ethers";
import { BaseInterface } from "./interfaces";
import { ConversionHelper } from "./helper";
import { getRPC } from "./utils/common";

export default class AuctionContract extends BaseInterface {
    constructor(provider?: ethers.providers.Provider | ethers.Signer) {
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        super(provider || rpcProvider, getAuctionAddress(), getAuctionAbi());
        if (!provider) {
            this._contract = new ethers.Contract(
                this._contractAddress,
                this._abis,
                rpcProvider
            );
        }
    }
    async createAuction(
        tokenId: number,
        initPrice: number,
        startTimestamp: number,
        endTimestamp: number
    ): Promise<string> {
        const tx = await this._contract.createAuction(
            tokenId,
            ConversionHelper._numberToEth(initPrice),
            startTimestamp,
            endTimestamp,
			this._option
        );
        return this._handleTransactionResponse(tx);
    }
    async joinAuction(auctionId: number, bid: number): Promise<string> {
        const tx = await this._contract.joinAuction(
            auctionId,
            ConversionHelper._numberToEth(bid),
			this._option
        );
        return this._handleTransactionResponse(tx);
    }
    async endAuction(auctionId: number) {
        const tx = await this._contract.endAuction(auctionId, this._option);
        return this._handleTransactionResponse(tx);
    }
    async cancelAuction(auctionId: number) {
        const tx = await this._contract.cancelAuction(auctionId, this._option);
        return this._handleTransactionResponse(tx);
    }
    async getAuctionActive() {
        const auctions = await this._contract.getAuctionByState(true);
        return auctions;
    }
    async getAuctionInfo(auctionId: number) {
        const auctionInfo = await this._contract.getAuction(auctionId);
        return auctionInfo;
    }
}
