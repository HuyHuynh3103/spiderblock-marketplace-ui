import {
    Modal,
    ModalOverlay,
    ModalProps,
    ModalContent,
    ModalBody,
    Text,
    Button,
    Flex,
    ModalCloseButton,
    Image,
    Input,
} from "@chakra-ui/react";
import { INftItem } from "@/_types_";
import React from "react";
import { getTime, getUnixTime } from "date-fns";
interface IProps extends Omit<ModalProps, "children"> {
    nft?: INftItem;
    isProcessing?: boolean;
	symbol: string;
    onAuction?: (amount?: number, expireDate?: Date | null) => void;
}

export default function AuctionModal({
    nft,
    isProcessing,
	symbol,
    onAuction,
    ...props
}: IProps) {
    const [amount, setAmount] = React.useState<number>();
    const [startDate, setStartDate] = React.useState<Date | null>(new Date());

    return (
        <Modal closeOnOverlayClick={false} {...props}>
            <ModalOverlay
                blur="2xl"
                bg="blackAlpha.300"
                backdropFilter="blur(10px)"
            />
            <ModalContent py="30px">
                <ModalCloseButton />
                <ModalBody>
                    <Flex alignItems="center" w="full" direction="column">
                        <Image
                            src={nft?.image}
                            alt={nft?.name}
                            borderRadius="20px"
                            w="80%"
                            mb="20px"
                        />
                        <Flex w="full" direction="column">
                            <Text fontWeight="bold">Reserve price</Text>
                            <Text
                                fontSize="12px"
                                fontStyle="italic"
                                color="rgba(255,255,255,0.5)"
                            >
                                Set your price:
                            </Text>
                            <Flex w="full" my="10px">
                                <Input
                                    placeholder="Input initial price"
                                    borderRadius="6px"
                                    min="0"
                                    w="full"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(Number(e.target.value))
                                    }
                                    type="number"
                                />
                                <Text
                                    fontWeight="bold"
                                    fontSize="20px"
                                    position="absolute"
                                    right="40px"
                                    color="rgba(255,255,255, 0.4)"
                                >
                                    {symbol}
                                </Text>
                            </Flex>

                            <Text fontWeight="bold" mb="10px">
                                Expiration date:
                            </Text>
                            <Input
                                onChange={(e) =>
                                    setStartDate(new Date(e.target.value))
                                }
                                placeholder="Select Date and Time"
                                size="md"
                                min={new Date().toISOString().split(".")[0]}
                                type="datetime-local"
                                mb="10px"
                                border-radius="6px"
                            />
                            <Button
                                variant="primary"
                                onClick={() =>
                                    onAuction && onAuction(amount, startDate)
                                }
                                isDisabled={!amount || isProcessing}
								isLoading={isProcessing}
								loadingText="Auctioning..."
                            >
                                Auction now
                            </Button>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
