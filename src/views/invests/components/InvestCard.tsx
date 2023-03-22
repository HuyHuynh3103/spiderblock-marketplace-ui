import { Box, Image, Text, Button, HStack, Spinner } from "@chakra-ui/react";
import React from "react";
import { numberFormat } from "@/utils";
import { IPackage, IWalletInfo } from "@/_types_";
import CrowSaleContract from "@/contracts/CrowdSaleContract";

interface IProps {
    pak: IPackage;
    isBuying: boolean;
    walletInfo?: IWalletInfo;
	symbol: string;
    onBuy: (paymentAmount: number) => void;
}

export default function InvestCard({
    pak,
    isBuying,
    walletInfo,
	symbol,
    onBuy,
}: IProps) {
    const [paymentAmount, setPaymentAmount] = React.useState<number>(0);
    const getNeedAmount = React.useCallback(async () => {
		const crowdContract = new CrowSaleContract();
        const amount = await crowdContract.getNeededAmount(
			pak.amount,
            pak.token
			);
        setPaymentAmount(amount);
    }, [pak.token]);
    React.useEffect(() => {
		getNeedAmount();
    }, [getNeedAmount]);
	
    return (
        <Box
            bg="bg.secondary"
            borderRadius="16px"
            overflow="hidden"
            padding="10px"
            border="1px solid rgba(254,223,86,.6)"
            alignItems="center"
            display="flex"
            flexDirection="column"
        >
            <Box
                bgImage={`/${pak.bg}`}
                w="full"
                h={["150px", "150px", "210px"]}
                borderRadius="16px"
                bgSize="cover"
                bgPos="center"
            />

            <Box
                margin="0px auto"
                borderRadius="full"
                marginTop={["-40px", "-40px", "-60px"]}
                position="relative"
            >
                <Image
                    src={`/${pak.icon}`}
                    alt="bnb"
                    w={["80px", "80px", "120px"]}
                    h={["80px", "80px", "120px"]}
                    borderRadius="full"
                    objectFit="cover"
                    border="6px solid rgba(254,223,86,.6)"
                />
                <Image
                    src="/verified.svg"
                    w={["60px", "60px", "80px"]}
                    alt="verified"
                    position="absolute"
                    bottom={["-20px", "-20px", "-30px"]}
                    right={["-10px", "-10px", "-20px"]}
                />
            </Box>

            <Text
                my="20px"
                fontSize={["18px", "18px", "24px"]}
                fontWeight="bold"
            >
                {pak.name.toLocaleUpperCase()}
            </Text>
            <Button
                disabled
                variant="primary"
                my="20px"
                bg="transparent"
                border="1px solid #fff"
                color="rgba(255,255,255, 0.7)"
            >
                {numberFormat(pak.amount)} {symbol}
            </Button>
            <HStack my="15px">
                <Text color="gray">Amount of coins to pay: </Text>
                <Text variant="notoSan" fontSize={["14px", "14px", "16px"]}>
                    {numberFormat(paymentAmount)} {pak.token}
                </Text>
            </HStack>

            <Button
                w="full"
                variant="primary"
                disabled={!walletInfo?.address || isBuying}
                onClick={() => onBuy(paymentAmount)}
            >
                {isBuying ? <Spinner /> : "Buy Now"}
            </Button>
        </Box>
    );
}
