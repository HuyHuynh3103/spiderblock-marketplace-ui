import { ChevronDownIcon } from "@chakra-ui/icons";
import {
    Menu,
    MenuButton,
    Button,
    MenuList,
    MenuItemOption,
    MenuOptionGroup,
} from "@chakra-ui/react";
import React from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";

export default function SwitchNetwork() {
    const { chain } = useNetwork();
    const { chains, error, isLoading, pendingChainId, switchNetwork } =
        useSwitchNetwork();
    console.log(chains);
    return (
        <Menu isLazy placement="bottom-end">
            <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                disabled={isLoading || !!error || !!pendingChainId}
                _loadingText="Switching..."
                flexWrap={{ base: "wrap", lg: "nowrap" }}
                overflow={{ base: "break-word", lg: "visible" }}
            >
                {chain?.name || "Select Network"}
            </MenuButton>
            <MenuList>
                <MenuOptionGroup
                    defaultValue={chain?.id?.toString()}
                    title="Network"
                    type="radio"
                >
                    {chains.map((chain) => (
                        <MenuItemOption
							value={chain.id.toString()}
                            disabled={!switchNetwork || chain.id === chain?.id}
                            key={chain.id}
                            minH="48px"
                            onClick={() => switchNetwork?.(chain.id)}
                        >
                            {chain.name}
                        </MenuItemOption>
                    ))}
                </MenuOptionGroup>
            </MenuList>
        </Menu>
    );
}
