import { Box, Divider, Flex, Image } from "@chakra-ui/react";
import React from "react";
interface IProps {
    text: string;
}
export default function Empty({ text }: IProps) {
    return (
        <Box
            w="100%"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={"#f5f5f5"}
        >
            <Flex
                justifyContent="center"
                alignItems="center"
                h="200px"
                direction="column"
            >
                <Image src="empty.png" />
                <Divider />
                <Box
                    color="gray.500"
                    fontWeight="semibold"
                    letterSpacing="wide"
                    fontSize="xs"
                    textTransform="uppercase"
                    ml="2"
                >
                    {text}
                </Box>
            </Flex>
        </Box>
    );
}
