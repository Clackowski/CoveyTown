import { Button, chakra, Container, FormLabel, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import HatTradingAreaController, {HatName} from '../../../../classes/interactable/HatTradingAreaController';
import {TicTacToeGridPosition} from "../../../../../../shared/types/CoveyTownSocket";
import PlayerData from "../../../../classes/PlayerData";

export type HatTradingProps = {
  tradingAreaController: HatTradingAreaController;
  updateQuantities: boolean
};

/**
 * A component that will render a single price label.
 */
const StyledPlayerLabel = chakra(FormLabel, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '100%',
    height: '10%',
    width: '100%',
    fontSize: '12px',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render a single image of a hat being traded.
 */
const StyledImage = chakra('img', {
  baseStyle: {
    width: '100px',
    height: '100px',
  },
});

/**
 * A component that will render a button to confirm trade.
 */
const StyledDecisionButton = chakra(Button, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '10%',
    padding: '10px',
    border: '1px solid black',
    fontSize: '12px',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render a single container including, type label, image, price label and button.
 */
const StyledPlayerTrade = chakra(Container, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '200px',
    height: '300px',
    border: '1px solid black',
    padding: '5px',
    flexWrap: 'wrap',
    bg: 'beige',
  },
});

/**
 * A component that will render all the trading visuals.
 */
const StyledTradingBox = chakra(Container, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '500px',
    height: '350px',
    padding: '5px',
    //flexWrap: 'wrap',
  },
});

/**
 * A component that will render a single price label.
 */
const StyledPlayerInventoryLabel = chakra(FormLabel, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '5%',
    width: '150px',
    fontSize: '20px',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render a single image of a hat being traded.
 */
const StyledInventorySlotImage = chakra('img', {
  baseStyle: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  },
});

/**
 * A component that will render a single lock button.
 */
const StyledInventorySlotButton = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    //padding: '5px',
    _disabled: {
      opacity: '100%',
    },
  },
});

const StyledQuantities = chakra(FormLabel, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '15px',
    width: '100%',
    _disabled: {
      opacity: '100%',
    },
  },
});

const StyledInventorySlotWithQuantities = chakra(Container, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    padding: '0px',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render all the trading visuals.
 */
const StyledInventory = chakra(Container, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    width: '100%',
    height: '100%',
    padding: '10px',
    flexWrap: 'wrap',
    bg: 'beige',
  },
});

/**
 * A component that will render all the trading visuals.
 */
const StyledInventoryWithLabel = chakra(Container, {
  baseStyle: {
    display: 'flex',
    border: '1px solid black',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '1000%',
    flexWrap: 'wrap',
    bg: 'beige',
  },
});

/**
 * A component that will render all the trading visuals.
 */
const StyledTradeContainer = chakra(Container, {
  baseStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    flexWrap: 'wrap',
    bg: 'lightblue',
  },
});

/**
 * A component that renders the puchase option screens
 *
 * The purchase option is re-rendered whenever the state changes
 *
 * @param shopAreaController the controller for the Hat Shop
 */
export default function TradingBox({ tradingAreaController, updateQuantities }: HatTradingProps): JSX.Element {
  const [offers, setOffers] = useState<HatName[]>(tradingAreaController.offers);
  const [isOurTurn, setIsOurTurn] = useState(tradingAreaController.isOurTurn);
  const [quantity0P1, setQuantity0P1] = useState<number>(0);
  const [quantity1P1, setQuantity1P1] = useState<number>(0);
  const [quantity2P1, setQuantity2P1] = useState<number>(0);
  const [quantity3P1, setQuantity3P1] = useState<number>(0);
  const [quantity4P1, setQuantity4P1] = useState<number>(0);
  const [quantity5P1, setQuantity5P1] = useState<number>(0);
  const [quantity6P1, setQuantity6P1] = useState<number>(0);
  const [quantity7P1, setQuantity7P1] = useState<number>(0);
  const [quantity8P1, setQuantity8P1] = useState<number>(0);
  const [quantity9P1, setQuantity9P1] = useState<number>(0);


  const toast = useToast();
  useEffect(() => {
    const fetchQuantities = async () => {
      try {
        const hatQuantities: number[] = await tradingAreaController.updateQuantities();
        setQuantity0P1(hatQuantities[0]);
        setQuantity1P1(hatQuantities[1]);
        setQuantity2P1(hatQuantities[2]);
        setQuantity3P1(hatQuantities[3]);
        setQuantity4P1(hatQuantities[4]);
        setQuantity5P1(hatQuantities[5]);
        setQuantity6P1(hatQuantities[6]);
        setQuantity7P1(hatQuantities[7]);
        setQuantity8P1(hatQuantities[8]);
        setQuantity9P1(hatQuantities[9]);
      } catch (e) {
        console.log(e);
        toast({
          title: 'Error getting hat quantities',
          description: (e as Error).toString(),
          status: 'error',
        });
      }
    };

    fetchQuantities();

    tradingAreaController.addListener('offersChanged', setOffers);
    tradingAreaController.addListener('turnChanged', setIsOurTurn);
    return () => {
      tradingAreaController.removeListener('turnChanged', setIsOurTurn);
      tradingAreaController.removeListener('offersChanged', setOffers);
    };
  }, [tradingAreaController, updateQuantities]);

  const handleOfferHat = async (hatName: string) => {
    try {
      await tradingAreaController.offerHat(hatName, tradingAreaController.offers.length);
    } catch (e) {
      toast({
        title: 'Error offering hat',
        description: (e as Error).toString(),
        status: 'error',
      });
    }
  };

  /*const updateQuantity = (index: number, value: number) => {
    const newQuantities = [...quantities];
    newQuantities[index] = value;
    setQuantities(newQuantities);
  };*/

  return (
    <StyledTradeContainer>
      <StyledTradingBox aria-label='Trading Boxes'>
      <StyledPlayerTrade aria-label='Player 1 Trade Box'>
        <StyledPlayerLabel aria-label='Player 1s offer'>
          {tradingAreaController.player1?.userName ? (
            <>
              {tradingAreaController.player1.userName}
              {"'s \noffer"}
            </>
          ) : (
            ''
          )}
        </StyledPlayerLabel>
        <StyledImage src={offers[0] ? `/assets/atlas/hat-icons/${offers[0]}.png` : '/assets/atlas/hat-icons/empty.png'} />

      </StyledPlayerTrade>

        <StyledDecisionButton
            aria-label={`Accept`}
            style={{ backgroundColor: '#008000' }}
          onClick={async () => {
            try {
              await tradingAreaController.performTrade(offers[0], offers[1]);
              toast({
                title: 'Trade Successful',
                description: 'Hats have been traded!',
                status: 'success',
              });
            } catch (e) {
              toast({
                title: 'Error Accepting Trade',
                description: 'Both players must offer hat before accepting!',
                status: 'error',
              });
            }
          }}
          disabled={false}>
            Accept
          </StyledDecisionButton>

      <StyledPlayerTrade aria-label='Player 2 Trade Box'>
        <StyledPlayerLabel aria-label='Player 2s offer'>
          {tradingAreaController.player2?.userName ? (
            <>
              {tradingAreaController.player2.userName}
              {"'s \noffer"}
            </>
          ) : (
            ''
          )}
        </StyledPlayerLabel>
        <StyledImage src={offers[1] ? `/assets/atlas/hat-icons/${offers[1]}.png` : '/assets/atlas/hat-icons/empty.png'} />

      </StyledPlayerTrade>
    </StyledTradingBox>
      <StyledInventoryWithLabel aria-label='Inventory Container including Player Label'>
      <StyledPlayerInventoryLabel aria-label='Player Inventory Label'>
        Your Inventory
      </StyledPlayerInventoryLabel>
      <StyledInventory aria-label='Inventory Container'>
        <StyledInventorySlotButton
          aria-label={`Inventory Slot 1 Button`}
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('baseball');
              // await tradingAreaController.offerHat('1');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/baseball.png' alt={'Hat 1'} />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label={`Inventory Slot 2 Button`}
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('chef');
              // await tradingAreaController.offerHat('2');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/chef.png' alt={'Hat 2'} />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label={`Inventory Slot 3 Button`}
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('winter');
              // await tradingAreaController.offerHat('3');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/winter.png' alt={'Hat 3'} />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label='Inventory Slot 4 Button'
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('cowboy');
              // await tradingAreaController.offerHat('4');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/cowboy.png' />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label='Inventory Slot 5 Button'
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('pirate');
              // await tradingAreaController.offerHat('5');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/pirate.png' />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label='Inventory Slot 6 Button'
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('tophat');
              // await tradingAreaController.offerHat('6');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/tophat.png' />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label='Inventory Slot 7 Button'
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('wizard');
              // await tradingAreaController.offerHat('7');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/wizard.png' />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label='Inventory Slot 8 Button'
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('party');
              // await tradingAreaController.offerHat('8');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/party.png' />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label='Inventory Slot 9 Button'
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('viking');
              // await tradingAreaController.offerHat('9');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/viking.png' />
        </StyledInventorySlotButton>
        <StyledInventorySlotButton
          aria-label='Inventory Slot 10 Button'
          size='square'
          onClick={async () => {
            try {
              await handleOfferHat('special');
              // await tradingAreaController.offerHat('10');
            } catch (e) {
              toast({
                title: 'Error offering hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
          disabled={!isOurTurn}
        >
          <StyledInventorySlotImage src='/assets/atlas/hat-icons/special.png' />
        </StyledInventorySlotButton>
      </StyledInventory>
        <StyledInventorySlotWithQuantities>
          <StyledQuantities>{quantity0P1}</StyledQuantities>
          <StyledQuantities>{quantity1P1}</StyledQuantities>
          <StyledQuantities>{quantity2P1}</StyledQuantities>
          <StyledQuantities>{quantity3P1}</StyledQuantities>
          <StyledQuantities>{quantity4P1}</StyledQuantities>
          <StyledQuantities>{quantity5P1}</StyledQuantities>
          <StyledQuantities>{quantity6P1}</StyledQuantities>
          <StyledQuantities>{quantity7P1}</StyledQuantities>
          <StyledQuantities>{quantity8P1}</StyledQuantities>
          <StyledQuantities>{quantity9P1}</StyledQuantities>
        </StyledInventorySlotWithQuantities>
    </StyledInventoryWithLabel>
    </StyledTradeContainer>

  );
}
