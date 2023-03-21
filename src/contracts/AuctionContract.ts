import { IAuctionInfo } from "@/_types_";
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
    async getAuctionInfo(auctionId: number) {
        const auctionInfo = await this._contract.getAuction(auctionId);
        return auctionInfo;
    }
    getAuctionActive = async (): Promise<IAuctionInfo[]> => {
        const rs = await this._contract.getAuctionByState(true);
        const results: IAuctionInfo[] = [];
        for (let i = 0; i < rs.length; i += 1) {
            const o = rs[i];
            const item: IAuctionInfo = {
                auctioneer: o[0],
                tokenId: ConversionHelper._toNumber(o[1]),
                initialPrice: ConversionHelper._toEther(o[2]),
                previousBidder: o[3],
                lastBid: ConversionHelper._toEther(o[4]),
                lastBidder: o[5],
                startTime: ConversionHelper._toNumber(o[6]),
                endTime: ConversionHelper._toNumber(o[7]),
                completed: o[8],
                active: o[9],
                id: ConversionHelper._toNumber(o[1]),
                image: "",
                auctionId: ConversionHelper._toNumber(o[10]),
            };
            results.push(item);
        }
        return results;
    };
}
