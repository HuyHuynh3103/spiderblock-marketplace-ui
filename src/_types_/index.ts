export interface IWalletInfo {
    address: string;
    nativeAmt: number;
}

export interface IRate {
    usdtRate: number;
    bnbRate: number;
}
export enum EToken {
	BNB = 'BNB',
	USDT = 'USDT'
}
export interface IPackage {
	key: string;
	name: string;
	amount: number;
	icon: string;
	bg: string;
	token: EToken
}

export interface IMenu {
	name: string;
	url: string
}