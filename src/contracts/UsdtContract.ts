import { getRPC } from './utils/common';
import { getUsdtAbi } from './utils/getAbis';
import { getUsdtAddress } from './utils/getAddress';
import { ethers } from "ethers";
import { Erc20 } from "./interfaces";

export default class UsdtContract extends Erc20 {
	constructor(provider: ethers.providers.Web3Provider) {
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        super(provider || rpcProvider, getUsdtAddress(), getUsdtAbi());
	}
}