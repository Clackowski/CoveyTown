import {
  ConversationArea,
  Interactable,
  TicTacToeGameState,
  ViewingArea,
  GameArea,
  ShopArea,
  HatShopState,
  TradingArea,
  HatTradingState,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

export function isTicTacToeArea(
  interactable: Interactable,
): interactable is GameArea<TicTacToeGameState> {
  return interactable.type === 'TicTacToeArea';
}

export function isHatShopArea(interactable: Interactable): interactable is ShopArea<HatShopState> {
  return interactable.type === 'HatShopArea';
}

export function isHatTradingArea(
  interactable: Interactable,
): interactable is TradingArea<HatTradingState> {
  return interactable.type === 'HatTradingArea';
}
