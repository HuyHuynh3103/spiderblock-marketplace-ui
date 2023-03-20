import { getCrowSaleAbi } from "./utils/getAbis";
import { getCrowSaleAddress } from "./utils/getAddress";
import { ethers } from "ethers";
import { BaseInterface } from "./interfaces";
import { getRPC } from "./utils/common";
import { ConversionHelper } from "./helper";

export default class CrowSaleContract extends BaseInterface {
    constructor(provider?: ethers.providers.Provider | ethers.Signer) {
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        super(provider || rpcProvider, getCrowSaleAddress(), getCrowSaleAbi());
        if (!provider) {
            this._contract = new ethers.Contract(
                this._contractAddress,
                this._abis,
                rpcProvider
            );
        }
    }
    async getNativeRate(): Promise<number> {
        let rate = await this._contract.native_rate();
		let percentage = await this._contract.PERCENTAGE_FRACTION();
        return ConversionHelper._toNumber(rate) / ConversionHelper._toNumber(percentage);
    }
    async getPaymentRate(): Promise<number> {
        let rate = await this._contract.token_rate();
		let percentage = await this._contract.PERCENTAGE_FRACTION();
        return ConversionHelper._toNumber(rate) / ConversionHelper._toNumber(percentage);
    }
    async buyTokenByNative(amount: number) {
        const rate = await this.getNativeRate();
		console.log('Provider', this._provider)
        const tx = await this._contract.buyByNative({
            ...this._option,
            value: ConversionHelper._numberToEth(amount * rate),
        });
        return this._handleTransactionResponse(tx);
    }
    async buyTokenByErc20(amount: number) {
        const rate = await this.getPaymentRate();
        const tx = await this._contract.buyByToken(
            ConversionHelper._numberToEth(amount * rate)
        );
        return this._handleTransactionResponse(tx);
    }
}
