import { Button, chakra, Container, FormLabel, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import HatAreaController from '../../../../classes/interactable/HatAreaController';

export type HatGameProps = {
  shopAreaController: HatAreaController;
};

/**
 * A component that will render a single pack type label.
 */
const StyledTypeLabel = chakra(FormLabel, {
  baseStyle: {
    display: 'flex',
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '100%',
    border: '1px solid black',
    height: '10%',
    width: '100%',
    fontSize: '14px',
    bg: 'lightblue',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render a single price label.
 */
const StyledPriceLabel = chakra(FormLabel, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '100%',
    border: '1px solid black',
    height: '10%',
    width: '100%',
    fontSize: '13px',
    bg: 'lightblue',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render a single image.
 */
const StyledImage = chakra('img', {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '75%',
    _disabled: {
      opacity: 1, // Opacity should be a number between 0 and 1
    },
  },
});

/**
 * A component that will render a single buy button.
 */
const StyledBuyButton = chakra(Button, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid black',
    height: '40px',
    width: '75px',
    fontSize: '20px',
    _disabled: {
      opacity: '100%',
    },
  },
});

/**
 * A component that will render a single container including, type label, image, price label and button.
 */
const StyledPurchaseOption = chakra(Container, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '150px',
    height: '300px',
    border: '1px solid black',
    padding: '10px',
    flexWrap: 'wrap',
  },
});

/**
 * A component that will render all the purchase options.
 */
const StyledPurchases = chakra(Container, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '500px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

/**
 * A component that renders the puchase option screens
 *
 * The purchase option is re-rendered whenever the state changes
 *
 * @param shopAreaController the controller for the Hat Shop
 */
export default function PurchaseScreens({ shopAreaController }: HatGameProps): JSX.Element {
  const toast = useToast();
  return (
    <StyledPurchases aria-label='Hat Shop'>
      <StyledPurchaseOption aria-label='Purchase Option 1' style={{ backgroundColor: '#5E70C7' }}>
        <StyledTypeLabel aria-label='Basic Label'>Basic Pack</StyledTypeLabel>
        <StyledPriceLabel aria-label='Basic Price'>Price = 20</StyledPriceLabel>
        <StyledImage src='/assets/atlas/hat-icons/EpicHatIcon.png' />
        <StyledBuyButton
          aria-label='Buy Pack 1 Button'
          onClick={async () => {
            try {
              const hatBought = await shopAreaController.purchasePack(0, 20);
               toast({
                title: 'Purchase Complete',
                description: 'Purchased ' + hatBought + ' hat!',
                status: 'success',
              });
            } catch (e) {
              toast({
                title: 'Error buying hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}>
          Buy
        </StyledBuyButton>
      </StyledPurchaseOption>
      <StyledPurchaseOption aria-label='Purchase Option 2' style={{ backgroundColor: '#bc531B' }}>
        <StyledTypeLabel aria-label='Epic Label'>Epic Pack</StyledTypeLabel>
        <StyledPriceLabel aria-label='Epic Price'>Price = 50</StyledPriceLabel>
        <StyledImage src='/assets/atlas/hat-icons/BasicHatIcon.png' />
        <StyledBuyButton
          aria-label='Buy Pack 2 Button'
          onClick={async () => {
            try {
              const hatBought = await shopAreaController.purchasePack(1, 50);
               toast({
                title: 'Purchase Complete',
                description: 'Purchased ' + hatBought + ' hat!',
                status: 'success',
              });
            } catch (e) {
              toast({
                title: 'Error buying hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}>
          Buy
        </StyledBuyButton>
      </StyledPurchaseOption>
      <StyledPurchaseOption aria-label='Purchase Option 3' style={{ backgroundColor: '#721BBC' }}>
        <StyledTypeLabel aria-label='Legendary Label'>Legendary Pack</StyledTypeLabel>
        <StyledPriceLabel aria-label='Legendary Price'>Price = 100</StyledPriceLabel>
        <StyledImage src='/assets/atlas/hat-icons/LegendaryHatIcon.png' />
        <StyledBuyButton
          aria-label='Buy Pack 3 Button'
          onClick={async () => {
            try {
              const hatBought = await shopAreaController.purchasePack(2, 100);
               toast({
                title: 'Purchase Complete',
                description: 'Purchased ' + hatBought + ' hat!',
                status: 'success',
              });
            } catch (e) {
              toast({
                title: 'Error buying hat',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}>
          Buy
        </StyledBuyButton>
      </StyledPurchaseOption>
    </StyledPurchases>
  );
}
