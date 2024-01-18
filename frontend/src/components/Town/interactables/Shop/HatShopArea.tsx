import {
  Button,
  Container,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import PlayerController from '../../../../classes/PlayerController';
import {
  useInteractable,
  useInteractableShopAreaController,
} from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID, ShopStatus } from '../../../../types/CoveyTownSocket';
import ShopAreaInteractable from '../ShopArea';
import HatAreaController from '../../../../classes/interactable/HatAreaController';
import PurchaseScreens from './HatPack';

/**
 * The HatShopArea component renders the Hat Shop area.
 * It renders the current state of the area, optionally allowing the player to join the shop.
 *
 * It uses Chakra-UI components
 *
 * It uses the HatAreaController to get the current state of the shop.
 * It listens for the 'shopUpdated' event on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the shopAreaController changes.
 *
 */
function HatShopArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const shopAreaController = useInteractableShopAreaController<HatAreaController>(interactableID);
  const townController = useTownController();

  const [shopStatus, setShopStatus] = useState<ShopStatus>(shopAreaController.status);
  //const [purchaseCount, setPurchaseCount] = useState<number>(shopAreaController.purchaseCount);
  //const [observers, setObservers] = useState<PlayerController[]>(shopAreaController.observers);
  const [joiningShop, setJoiningShop] = useState(false);
  const [customer, setCustomer] = useState<PlayerController | undefined>(
    shopAreaController.customer,
  );
  const toast = useToast();

  useEffect(() => {
    const updateShopState = () => {
      setShopStatus(shopAreaController.status || 'WAITING_TO_START');
      //setPurchaseCount(shopAreaController.purchaseCount || 0);
      //setObservers(shopAreaController.observers);
      setCustomer(shopAreaController.customer);
    };
    shopAreaController.addListener('shopUpdated', updateShopState);
    //shopAreaController.addListener('shopEnd', onShopEnd);
    return () => {
      //gameAreaController.removeListener('gameEnd', onGameEnd);
      shopAreaController.removeListener('shopUpdated', updateShopState);
    };
  }, [townController, shopAreaController, toast]);

  let shopStatusText = <></>;
  if (shopStatus === 'IN_PROGRESS') {
    shopStatusText = <>Shop being used</>;
  } else {
    let joinShopButton = <></>;
    if (
      (shopAreaController.status === 'WAITING_TO_START' && !shopAreaController.isPlayer) ||
      shopAreaController.status === 'OVER'
    ) {
      joinShopButton = (
        <Button
          onClick={async () => {
            setJoiningShop(true);
            try {
              await shopAreaController.joinShop();
            } catch (err) {
              toast({
                title: 'Error joining shop',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningShop(false);
          }}
          isLoading={joiningShop}
          disabled={joiningShop}>
          Join Shop
        </Button>
      );
    }
    shopStatusText = (
      <b>
        Shop {shopStatus === 'WAITING_TO_START' ? 'available' : 'closed'}. {joinShopButton}
      </b>
    );
  }
  return (
    <Container>
      {shopStatusText}
      <List aria-label='Name of Customer'>
        <ListItem>Customer: {customer?.userName || '(No customer yet!)'}</ListItem>
      </List>
      <PurchaseScreens shopAreaController={shopAreaController} />
    </Container>
  );
}

/**
 * A wrapper component for the Shop component.
 * Determines if the player is currently in a hat shop area on the map, and if so,
 * renders the TicTacToeArea component in a modal.
 *
 */
export default function ShopAreaWrapper(): JSX.Element {
  const shopArea = useInteractable<ShopAreaInteractable>('shopArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (shopArea) {
      townController.interactEnd(shopArea);
      const controller = townController.getShopAreaController(shopArea);
      controller.leaveShop();
    }
  }, [townController, shopArea]);

  if (shopArea && (shopArea.getData('type') === 'Hat' || shopArea.type)) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent style={{ backgroundColor: 'beige' }}>
          <ModalHeader>{shopArea.name}</ModalHeader>
          <ModalCloseButton />
          <HatShopArea interactableID={shopArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
