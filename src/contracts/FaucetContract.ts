import { getFaucetAbi } from './utils/getAbis';
import { getFaucetAddress } from './utils/getAddress';
import { BigNumber, ethers } from "ethers";
import { BaseInterface } from "./interfaces";
import { getRPC } from './utils/common';
import { ConversionHelper } from './helper';

export default class FaucetContract extends BaseInterface {
    constructor(provider?: ethers.providers.Provider | ethers.Signer) {
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        super(provider || rpcProvider, getFaucetAddress(), getFaucetAbi());
        if (!provider) {
            this._contract = new ethers.Contract(
                this._contractAddress,
                this._abis,
                rpcProvider
            );
        }
    }

	async faucet(address: String):Promise<string> {
		const tx = await this._contract.createFaucet(address, this._option);
		return this._handleTransactionResponse(tx);
	} 

	async getFaucetAmount(): Promise<number> {
		const _amount:BigNumber = await this._contract.mint_amount();
		return ConversionHelper._toNumber(_amount);
	}

}