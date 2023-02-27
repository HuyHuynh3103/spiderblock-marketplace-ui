import { Box, Image, Text, Button, HStack, Spinner } from "@chakra-ui/react";
import React from "react";
import { numberFormat } from "../utils";
import { IPackage, IWalletInfo } from "../_types_";

interface IProps {
  pak: IPackage;
  isBuying: boolean;
  rate: number;
  walletInfo?: IWalletInfo;
  onBuy?: () => void;
}

export default function InvestCard({
  pak,
  isBuying,
  rate,
  walletInfo,
  onBuy,
}: IProps) {
  return (
    <Box
      w={["100%", "100%", "380px"]}
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
        w={["80px", "80px", "120px"]}
        h={["80px", "80px", "120px"]}
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

      <Text my="20px" fontSize={["18px", "18px", "24px"]} fontWeight="bold">
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
        {numberFormat(pak.amount)} IPT
      </Button>
      <HStack my="15px">
        <Text color="gray">Amount of coins to pay: </Text>
        <Text variant="notoSan" fontSize={["14px", "14px", "16px"]}>
          {numberFormat(pak.amount / rate)} {pak.token}
        </Text>
      </HStack>

      <Button w="full" variant="primary" disabled={!walletInfo?.address || isBuying} onClick={onBuy}>
        {isBuying ? <Spinner /> : 'Buy Now'}
      </Button>

    </Box>
  );
}
