import { IAuctionInfo } from "@/_types_";
import { getDesiredGateWay, getRPC } from "./utils/common";
import { INftItem } from "./../_types_/index";
import { getNftAbi } from "./utils/getAbis";
import { getNftAddress } from "./utils/getAddress";
import { BigNumber, ethers } from "ethers";
import { Erc721 } from "./interfaces";
import { ConversionHelper, IpfsHelper } from "./helper";

export default class NftContract extends Erc721 {
    constructor(provider?: ethers.providers.Provider | ethers.Signer) {
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        super(provider || rpcProvider, getNftAddress(), getNftAbi());
        if (!provider) {
            this._contract = new ethers.Contract(
                this._contractAddress,
                this._abis,
                rpcProvider
            );
        }
    }
    private async _listTokenIds(walletAddr: string): Promise<number[]> {
        const idsBigNum: BigNumber[] = await this._contract.listTokenIds(
            walletAddr
        );
        const ids = await Promise.all(
            idsBigNum.map((idBigNum) => ConversionHelper._toNumber(idBigNum))
        );
        return ids;
    }
    private async _tokenURI(tokenId: number): Promise<string> {
        return await this._contract.tokenURI(tokenId);
    }
    async getNftItemByTokenId(id: number, others = {}): Promise<INftItem> {
        const tokenUrl = await this._tokenURI(id);
        const urlMetadata = IpfsHelper.parseToGateway(
            tokenUrl,
            getDesiredGateWay()
        );
        const metadata = await (await fetch(`${urlMetadata}.json`)).json();
        const imageUrl = IpfsHelper.parseToGateway(
            metadata.image,
            getDesiredGateWay()
        );
        const item: INftItem = {
            ...metadata,
            ...others,
            id,
            image: imageUrl,
        };
        return item;
    }
    async getListNfts(walletAddress: string): Promise<INftItem[]> {
        const ids = await this._listTokenIds(walletAddress);
        return Promise.all(
            ids.map(async (id: number) => {
                return await this.getNftItemByTokenId(id);
            })
        );
    }
    async getNftInfo(nfts: Array<any>): Promise<INftItem[]> {
        return Promise.all(
            nfts.map(async (nft: any) => {
                return await this.getNftItemByTokenId(nft.tokenId, nft);
            })
        );
    }
    getNftAuctionInfo = async (nftsAuctions: IAuctionInfo[]) => {
        return Promise.all(
            nftsAuctions.map(async (o: IAuctionInfo) => {
                const tokenUrl = await this._contract.tokenURI(o.tokenId);
                const obj = await (await fetch(`${tokenUrl}.json`)).json();
                const item: IAuctionInfo = { ...o, ...obj, id: o.tokenId };
                return item;
            })
        );
    };
}
