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
  useInteractableTradeAreaController,
} from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID, TradeStatus } from '../../../../types/CoveyTownSocket';
import TradingAreaInteractable from '../TradeArea';
import TradingBox from './TradingBox';
import HatTradingAreaController from '../../../../classes/interactable/HatTradingAreaController';
import PlayerData from "../../../../classes/PlayerData";

/**
 * The HatTradingArea component renders the Hat Trading area.
 * It renders the current state of the area, optionally allowing the player to join the trade.
 *
 * It uses Chakra-UI components
 *
 * It uses the HatTradingAreaController to get the current state of the trade.
 * It listens for the 'tradeUpdated' event on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the shopAreaController changes.
 *
 */
function HatTradingArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const tradingAreaController =
    useInteractableTradeAreaController<HatTradingAreaController>(interactableID);
  const townController = useTownController();

  const [tradeStatus, setTradeStatus] = useState<TradeStatus>(tradingAreaController.status);
  //const [purchaseCount, setPurchaseCount] = useState<number>(shopAreaController.purchaseCount);
  //const [observers, setObservers] = useState<PlayerController[]>(shopAreaController.observers);
  const [joiningTrade, setJoiningTrade] = useState(false);
  const [player1, setPlayer1] = useState<PlayerController | undefined>(
    tradingAreaController.player1,
  );
  const [player2, setPlayer2] = useState<PlayerController | undefined>(
    tradingAreaController.player2,
  );
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    const updateTradeState = () => {
      setTradeStatus(tradingAreaController.status || 'WAITING_TO_START');
      //setPurchaseCount(shopAreaController.purchaseCount || 0);
      //setObservers(shopAreaController.observers);
      setPlayer1(tradingAreaController.player1);
      setPlayer2(tradingAreaController.player2);
    };
    tradingAreaController.addListener('tradeUpdated', updateTradeState);
    //shopAreaController.addListener('shopEnd', onShopEnd);
    return () => {
      //gameAreaController.removeListener('gameEnd', onGameEnd);
      tradingAreaController.removeListener('tradeUpdated', updateTradeState);
    };
  }, [townController, tradingAreaController, toast]);

  let tradeStatusText = <></>;
  if (tradeStatus === 'IN_PROGRESS') {
    tradeStatusText = (
      <>
        Trading in progress, waiting on{' '}
        {tradingAreaController.whoseTurn === townController.ourPlayer
          ? 'you '
          : tradingAreaController.whoseTurn?.userName}
        to select an item to trade
      </>
    );
  } else {
    let joinTradeButton = <></>;
    if (
      (tradingAreaController.status === 'WAITING_TO_START' && !tradingAreaController.isPlayer) ||
      tradingAreaController.status === 'OVER'
    ) {
      joinTradeButton = (
        <Button
          onClick={async () => {
            setJoiningTrade(true);
            try {
              await tradingAreaController.joinTrade();
              setShouldUpdate(!shouldUpdate);
            } catch (err) {
              toast({
                title: 'Error joining trade',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningTrade(false);
          }}
          isLoading={joiningTrade}
          disabled={joiningTrade}>
          Join Trading Session
        </Button>
      );
    }
    tradeStatusText = (
      <b>
        {joinTradeButton}
      </b>
    );
  }
  return (
    <Container>
      {tradeStatusText}
      <List aria-label='list of traders'>
        <ListItem>Player 1: {player1?.userName || '(No trader yet!)'}</ListItem>
        <ListItem>Player 2: {player2?.userName || '(No trader yet!)'}</ListItem>
      </List>
      <TradingBox tradingAreaController={tradingAreaController} updateQuantities={shouldUpdate}/>
    </Container>
  );
}

/**
 * A wrapper component for the Trading component.
 * Determines if the player is currently in a hat trading area on the map, and if so,
 * renders the HatTrading component in a modal.
 *
 */
export default function TradingAreaWrapper(): JSX.Element {
  const tradingArea = useInteractable<TradingAreaInteractable>('tradeArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (tradingArea) {
      townController.interactEnd(tradingArea);
      const controller = townController.getTradingAreaController(tradingArea);
      controller.leaveTrade();
    }
  }, [townController, tradingArea]);

  if (tradingArea && (tradingArea.getData('type') === 'Trade' || tradingArea.type)) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent style={{ backgroundColor: 'lightblue' }}>
          <ModalHeader>{tradingArea.name}</ModalHeader>
          <ModalCloseButton />
          <HatTradingArea interactableID={tradingArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
