import { ethers } from "ethers";
import ConversionHelper from "../helper/conversion";
import BaseInterface from "./BaseInterface";

class Erc20 extends BaseInterface {

	constructor(
		provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider,
		address: string, 
		abi: ethers.ContractInterface
	) {
		super(provider, address, abi);
	}
	async balanceOf(walletAddress: string): Promise<number>{
		const balance = await this._contract.balanceOf(walletAddress);
		return ConversionHelper._toNumber(balance);
	}
	async owner(): Promise<string> {
		return this._contract.owner();
	}
	async totalSuply(): Promise<number> {
		const total = await this._contract.totalSupply();
		return ConversionHelper._toNumber(total);
	}
	async name(): Promise<string> {
		return this._contract.name();
	}
	async symbol(): Promise<string> {
		return this._contract.symbol();
	}
	async approve(address: string, amount:number) {
		const wei = ConversionHelper._toWei(amount);
		await this._contract.approve(address, wei, this._option);
	}
}
export default Erc20;