import { TransactionResponse } from "@ethersproject/abstract-provider";
import { ethers, Overrides } from "ethers";

export default class BaseInterface {
    _provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
    _contractAddress: string;
    _abis: ethers.ContractInterface;
    _contract: ethers.Contract;
    _option: Overrides;

    constructor(
        provider:
            | ethers.providers.Web3Provider
            | ethers.providers.JsonRpcProvider,
        address: string,
        abi: ethers.ContractInterface
    ) {
        this._provider = provider, 
		this._contractAddress = address;
        this._abis = abi;
        this._contract = new ethers.Contract(address, abi, provider.getSigner());
        this._option = { gasLimit: 300000 };
    }
    _handleTransactionResponse = async (tx: TransactionResponse) => {
        try {
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (er: any) {
            throw new Error(er?.reason || `${er}`);
        }
    };
}
