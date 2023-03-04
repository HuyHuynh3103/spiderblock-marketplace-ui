import { getDesiredGateWay } from "./utils/common";
import { INftItem } from "./../_types_/index";
import { getNftAbi } from "./utils/getAbis";
import { getNftAddress } from "./utils/getAddress";
import { BigNumber, ethers } from "ethers";
import { Erc721 } from "./interfaces";
import { ConversionHelper, IpfsHelper } from "./helper";

export default class NftContract extends Erc721 {
    constructor(provider: ethers.providers.Web3Provider) {
        super(provider, getNftAddress(), getNftAbi());
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
    async getNftItemByTokenId(id: number): Promise<INftItem> {
        const tokenUrl = await this._tokenURI(id);
        const urlMetadata = IpfsHelper.parseToGateway(
            tokenUrl,
            getDesiredGateWay()
        );
        const metadata = await(await fetch(`${urlMetadata}.json`)).json();
        const imageUrl = IpfsHelper.parseToGateway(
            metadata.image,
            getDesiredGateWay()
        );
        const item: INftItem = {
            ...metadata,
            id,
            image: imageUrl,
        };
        return item;
    }
    async getListNfts(walletAddress: string): Promise<INftItem[]> {
        const ids = await this._listTokenIds(walletAddress);
        console.log(ids);
        return Promise.all(
            ids.map(async (id: number) => {
				return await this.getNftItemByTokenId(id)
            })
        );
    }
    async getNftInfo(nfts: Array<any>): Promise<INftItem[]> {
        return Promise.all(
            nfts.map(async (nft: any) => {
                return await this.getNftItemByTokenId(nft.id)
            })
        );
    }
}
