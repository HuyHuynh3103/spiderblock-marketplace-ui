import { EToken } from "@/_types_";
import { getCrowSaleAbi } from "./utils/getAbis";
import { getCrowSaleAddress } from "./utils/getAddress";
import { BigNumber, ethers } from "ethers";
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
    async buyTokenByNative(nativeAmount: number): Promise<string> {
        const tx = await this._contract.buyByNative({
            ...this._option,
            value: ConversionHelper._numberToEth(nativeAmount),
        });
        return this._handleTransactionResponse(tx);
    }
    async buyTokenByErc20(paymentTokenAmount: number): Promise<string> {
        const tx = await this._contract.buyByToken(
            ConversionHelper._numberToEth(paymentTokenAmount), this._option
        );
        return this._handleTransactionResponse(tx);
    }
    async getNeededAmount(icoAmount: number, token: EToken): Promise<number> {
        let tokenAddress: String;
        if (token == EToken.BNB) {
            tokenAddress = ethers.constants.AddressZero;
        } else {
            tokenAddress = await this._contract.payment_token();
        }
        const result: { success: boolean; value: BigNumber } =
		await this._contract.getNeededAmount(tokenAddress, ConversionHelper._numberToEth(icoAmount));
        return ConversionHelper._toEther(result.value);
    }
}
