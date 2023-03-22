import { EToken, IMenu, IPackage } from "@/_types_";
export const packages: IPackage[] = [
    {
        key: "bnb-01",
        name: "bnb package 01",
        amount: 100,
        bg: "bnb-bg.jpeg",
        icon: "bnb.png",
        token: EToken.BNB,
    },
    {
        key: "bnb-02",
        name: "bnb package 02",
        amount: 200,
        bg: "bnb-bg.jpeg",
        icon: "bnb.png",
        token: EToken.BNB,
    },
    {
        key: "usdt-01",
        name: "usdt package 01",
        amount: 100,
        bg: "usdt-bg.png",
        icon: "usdt.png",
        token: EToken.USDT,
    },
    {
        key: "usdt-02",
        name: "usdt package 02",
        amount: 200,
        bg: "usdt-bg.png",
        icon: "usdt.png",
        token: EToken.USDT,
    },
    {
        key: "usdt-03",
        name: "usdt package 03",
        amount: 300,
        bg: "usdt-bg.png",
        icon: "usdt.png",
        token: EToken.USDT,
    },
];

export const menus: IMenu[] = [
	{
		header: "ICO Investment",
		name: "Invest",
        url: "/", 
    },
	{
		header: "Faucet Token",
		name: "Faucet",
		url: "/faucet"
	},
    {
		header: "My Collection",
        name: "Collection",
        url: "/collection",
    },
    {
		header: "P2P Trading",
        name: "P2P",
        url: "/p2p",
    },
    {
		header: "Openning Auction",
        name: "Auction",
        url: "/auction",
    },
];
