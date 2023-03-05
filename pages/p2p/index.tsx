import P2PView from '@/views/p2ps'
import { Divider, Flex, Heading } from '@chakra-ui/react'
import React from 'react'

export default function P2PMarket() {
  return (
	<Flex w="full" direction="column">
		<Heading color="#fedf56">P2P Trading</Heading>
		<Divider my="10px" />
		<P2PView />
	</Flex>
  )
}
