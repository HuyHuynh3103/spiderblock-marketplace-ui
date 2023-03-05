import { getRPC } from "./utils/common";
import { getFlopAbi } from "./utils/getAbis";
import { getFlopAddress } from "./utils/getAddress";
import { ethers } from "ethers";
import { Erc20 } from "./interfaces";
import { ConversionHelper } from "./helper";

export default class FlopContract extends Erc20 {
    constructor(provider?: ethers.providers.Web3Provider) {
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        super(provider || rpcProvider, getFlopAddress(), getFlopAbi());
        if (!provider) {
            this._contract = new ethers.Contract(
                this._contractAddress,
                this._abis,
                rpcProvider
            );
        }
    }
    async mint(_address: string, _amount: number): Promise<void> {
        const wei = ConversionHelper._toWei(_amount);
        await this._contract.mint(_address, wei);
    }
}
