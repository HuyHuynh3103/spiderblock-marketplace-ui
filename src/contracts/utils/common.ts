export type AddressType = {
	97: string,
	56: string
}

export enum CHAIN_ID {
	TESTNET = 97,
	MAINNET = 56
}

export default function getChainIdFromEnv(): number {
	const env = process.env.NEXT_PUBLIC_CHAIN_ID;
	if(!env) {return 97}
	return parseInt(env)
}

export const getRPC = () => {
	if(getChainIdFromEnv() === CHAIN_ID.MAINNET){
		return process.env.NEXT_PUBLIC_RPC_MAINNET
	}
	return process.env.NEXT_PUBLIC_RPC_TESTNET;
}

export const SMART_ADDRESS = {
	CROWD_SALE: {
		97: '0xeb8b938Dc941f2F1Ba1D5b0b44Afa056d5b79222',
		56: ''
	},
	USDT: {
		97: '0xE1937cAcDA6C1f341c11626193bDff3a2eb3429E',
		56: ''
	}
}