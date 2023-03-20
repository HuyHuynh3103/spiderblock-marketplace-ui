
import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, ModalProps, Text } from "@chakra-ui/react";

interface IProps extends Omit<ModalProps, "children"> {
	errorCode?:string;
	reason?:string
}

export default function FailureModal({errorCode, reason, ...props}: IProps) {
	
	return (
		<Modal closeOnOverlayClick={false} {...props} >
			<ModalOverlay
				blur="2xl"
				bg="blackAlpha.300"
				backdropFilter="blur(10px)"
				>
					<ModalContent py="30px">
						<ModalCloseButton />
						<ModalBody>
							<Flex
								alignItems="center"
								justifyContent="center"
								w="full"
								direction="column"
							>
								<Text variant="notoSan" fontSize="20px">
									Transaction Failed
								</Text>
								<Text fontStyle="italic" fontSize="12px" mt="10px">
									{reason}
								</Text>
								<Text fontStyle="italic" fontSize="12px" mt="10px">
									{errorCode}
								</Text>
								<Button w="full" variant="primary" mt="20px" onClick={props.onClose}>
									Close
								</Button>
							</Flex>
						</ModalBody>
					</ModalContent>
				</ModalOverlay>
		</Modal>
	)
}

