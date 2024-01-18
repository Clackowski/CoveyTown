import _ from 'lodash';
import { HatOffer, HatTradingState, ShopStatus, TradingArea } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TradingAreaController, { TradeEventTypes } from './TradingAreaController';
import PlayerData from "../PlayerData";

export const PLAYER_NOT_IN_TRADE_ERROR = 'Player is not in trade';
export const NO_TRADE_IN_PROGRESS_ERROR = 'No trade in progress';

export type HatName = '' | 'baseball' | 'chef' | 'winter' | 'tophat' | 'cowboy' | 'pirate' | 'wizard' | 'party' | 'viking' | 'special';
export type OfferEvents = TradeEventTypes & {
  offersChanged: (offers: HatName[]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Hat Trade, and for sending commands to the server
 */
export default class HatTradingAreaController extends TradingAreaController<
  HatTradingState,
  OfferEvents
> {
  protected _offers: HatName[] = [];

  /**
   * Returns the current state of offers
   */
  get offers(): HatName[] {
    return this._offers;
  }

  /**
   * Returns the player who represents player1, if there is one, or undefined otherwise
   */
  get player1(): PlayerController | undefined {
    const player1 = this._model.trade?.state.player1;
    if (player1) {
      return this.occupants.find(eachOccupant => eachOccupant.id === player1);
    }
    return undefined;
  }

  /**
   * Returns the player who represents player2, if there is one, or undefined otherwise
   */
  get player2(): PlayerController | undefined {
    const player2 = this._model.trade?.state.player2;
    if (player2) {
      return this.occupants.find(eachOccupant => eachOccupant.id === player2);
    }
    return undefined;
  }

  /**
   * Returns the number of offers that have been made in the shop
   */
  get offerCount(): number {
    return this._model.trade?.state.offers.length || 0;
  }

  /**
   * Returns the player whose turn it is, if the trade is in progress
   * Returns undefined if the trade is not in progress
   */
  get whoseTurn(): PlayerController | undefined {
    const player1 = this.player1;
    const player2 = this.player2;
    if (!player1 || !player2 || this._model.trade?.state.status !== 'IN_PROGRESS') {
      return undefined;
    }
    if (this.offerCount % 2 === 0) {
      return player1;
    } else if (this.offerCount % 2 === 1) {
      return player2;
    } else {
      throw new Error('Invalid offer count');
    }
  }

  get isOurTurn(): boolean {
    return this.whoseTurn?.id === this._townController.ourPlayer.id;
  }

  /**
   * Returns true if the current player is a player in this trade
   */
  get isPlayer(): boolean {
    return this._model.trade?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Returns the current player, if the current player is a player in this trade
   *
   * Throws an error PLAYER_NOT_IN_TRADE_ERROR if the current player is not a player in this trade
   */
  get currPlayer(): 1 | 2 {
    if (this.player1?.id === this._townController.ourPlayer.id) {
      return 1;
    } else if (this.player2?.id === this._townController.ourPlayer.id) {
      return 2;
    }
    throw new Error(PLAYER_NOT_IN_TRADE_ERROR);
  }

  /**
   * Returns the status of the trade.
   * Defaults to 'WAITING_TO_START' if the trade is not in progress
   */
  get status(): ShopStatus {
    const status = this._model.trade?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Returns true if the trade is in progress
   */
  public isActive(): boolean {
    return this._model.trade?.state.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this HatTradingAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the players of this trade area and
   * other common properties (including this._model).
   *
   * If the offers list has changed, emits a 'offersChanged' event with the new offer. If the offers list has not changed,
   *  does not emit the event.
   *
   *  If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   *
   */
  protected _updateFrom(newModel: TradingArea<HatTradingState>): void {
    const wasOurTurn = this.whoseTurn?.id === this._townController.ourPlayer.id;
    super._updateFrom(newModel);
    const newState = newModel.trade;
    if (newState) {
      const newOffers: HatName[] = [];
      newState.state.offers.forEach((offer: HatOffer) => {
        newOffers[offer.offerNumber] = offer.hatIDToGive as HatName;
      });
      if (!_.isEqual(newOffers, this._offers)) {
        this._offers = newOffers;
        this.emit('offersChanged', this._offers);
      }
    }
    const isOurTurn = this.whoseTurn?.id === this._townController.ourPlayer.id && this.isActive();
    if (wasOurTurn != isOurTurn) this.emit('turnChanged', isOurTurn);
  }

  /**
   * Sends a request to the server to make a purchase
   *
   * If the shop is not in progress, throws an error NO_SHOP_IN_PROGRESS_ERROR
   *
   * @param hatID Index of pack that is being purchased
   */
  public async offerHat(hatID: string, offerCount: number) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.trade?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_TRADE_IN_PROGRESS_ERROR);
    }
    const playerData = new PlayerData();
    const amountHats = await playerData.getHatQuantity(this._townController.ourPlayer.userName, hatID);

    if (amountHats <= 0) {
      throw new Error('You have 0 ' + hatID + ' hats');
    }

    // trade


    await this._townController.sendInteractableCommand(this.id, {
      type: 'TradeOffer',
      tradeID: instanceID,
      offer: {
        playerOfferingHat: this.currPlayer,
        hatIDToGive: hatID,
        offerNumber: offerCount,
      },
    });
  }

  public async updateQuantities() {
    const playerData = new PlayerData();
    let quantities = [];
    const hats = ['baseball', 'chef', 'winter', 'cowboy', 'pirate', 'tophat', 'wizard', 'party', 'viking', 'special'];

    const allPlayers = await playerData.getAllPlayers();
    for (let playerIndex = 0; playerIndex < allPlayers.length; playerIndex++) {

      if (allPlayers[playerIndex].username === this._townController.ourPlayer.userName) {
        for (let hatIndex = 0; hatIndex < hats.length; hatIndex++) {
          quantities[hatIndex] = await playerData.getHatQuantity(allPlayers[playerIndex].username, hats[hatIndex]);
        }
      }
    }
    return quantities;
  }

  public async performTrade(hat1: string, hat2: string) {
    const playerData = new PlayerData();

    if (this.player1?.userName && this.player2?.userName) {
      await playerData.addHat(this.player2?.userName, hat1);
      await playerData.addHat(this.player1?.userName, hat2);
      await playerData.removeHat(this.player1?.userName, hat1);
      await playerData.removeHat(this.player2?.userName, hat2);
      await this.player1.updateLocalInventory();
      await this.player2.updateLocalInventory();
    }
  }
}
