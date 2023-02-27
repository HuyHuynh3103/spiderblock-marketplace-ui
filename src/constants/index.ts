import { EToken, IPackage } from './../_types_/index';
export const packages: IPackage[] = [
	{
		key: 'bnb-01',
		name: 'bnb package 01',
		amount: 1000,
		bg: 'bnb-bg.jpeg',
		icon: 'bnb.png',
		token: EToken.BNB
	},
	{
		key: 'bnb-02',
		name: 'bnb package 02',
		amount: 2000,
		bg: 'bnb-bg.jpeg',
		icon: 'bnb.png',
		token: EToken.BNB
	},
	{
		key: 'usdt-01',
		name: 'usdt package 01',
		amount: 1000,
		bg: 'usdt-bg.png',
		icon: 'usdt.png',
		token: EToken.USDT
	},
	{
		key: 'usdt-02',
		name: 'usdt package 02',
		amount: 2000,
		bg: 'usdt-bg.png',
		icon: 'usdt.png',
		token: EToken.USDT
	},
	{
		key: 'usdt-03',
		name: 'usdt package 03',
		amount: 3000,
		bg: 'usdt-bg.png',
		icon: 'usdt.png',
		token: EToken.USDT
	},
]