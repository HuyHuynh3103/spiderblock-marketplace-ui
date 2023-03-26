import "@/../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/themes";
import MainLayout from "@/layouts";
import {
    EthereumClient,
    w3mConnectors,
    w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
    throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

// 2. Configure wagmi client
const supportChains = [bscTestnet, bsc];
const { provider, chains, webSocketProvider } = configureChains(
    supportChains,
    (() => {
		let providers: any = [];
		providers.push(publicProvider());
		providers.push(w3mProvider({ projectId }));
        if (process.env.NEXT_PUBLIC_INFURA_KEY) {
            providers.push(
                infuraProvider({
                    apiKey: process.env.NEXT_PUBLIC_INFURA_KEY,
                })
            );
        }
        if (process.env.NEXT_PUBLIC_ALCHEMY_KEY) {
            providers.push(
                alchemyProvider({
                    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
                })
            );
        }
        return providers;
    })()
);
const wagmiClient = createClient({
    autoConnect: true,
    connectors: w3mConnectors({ version: 1, chains, projectId }),
    provider,
    webSocketProvider,
});
// 3. Configure modal ethereum client
const ethereumClient = new EthereumClient(wagmiClient, chains);

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
export default function App({ Component, pageProps }: AppProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(true);
    }, []);
    return (
        <>
            <WagmiConfig client={wagmiClient}>
                <ChakraProvider theme={theme}>
                    {ready ? (
                        <MainLayout>
                            <Component {...pageProps} />
                        </MainLayout>
                    ) : null}
                </ChakraProvider>
            </WagmiConfig>
            <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </>
    );
}
