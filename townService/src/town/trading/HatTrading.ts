import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { HatOffer, HatTradingState, TradeOffer } from '../../types/CoveyTownSocket';
import Trade from './Trade';

/**
 * HatTrading is a Trade that implements trading hats between players.
 */
export default class HatTrading extends Trade<HatTradingState, HatOffer> {
  public constructor() {
    super({
      offers: [],
      status: 'WAITING_TO_START',
    });
  }

  private _checkForEndOfTradeSession() {
    // If both players have made an offer and accepted
    if (this.state.offers.length === 2) {
      this.state = {
        ...this.state,
        status: 'OVER',
      };
    }
  }

  private _performTrade(offer: HatOffer): void {
    this.state = {
      ...this.state,
      offers: [...this.state.offers, offer],
    };
    this._checkForEndOfTradeSession();
  }

  /**
   * Applies a player's offer to the trading session.
   * Validates the offer before applying it. If the offer is invalid, throws an InvalidParametersError with
   * the error message specified below.
   *
   * @param offer The offer to apply to the trading session
   * @throws InvalidParametersError if the offer is invalid
   */
  public performTrade(offer: TradeOffer<HatOffer>): void {
    let playerOfferingHat: 1 | 2;
    if (offer.playerID === this.state.player1) {
      playerOfferingHat = 1;
    } else {
      playerOfferingHat = 2;
    }
    const cleanOffer = {
      playerOfferingHat,
      hatIDToGive: offer.offer.hatIDToGive,
      offerNumber: offer.offer.offerNumber,
    };
    // this._validateOffer(cleanOffer);
    this._performTrade(cleanOffer);
  }

  /**
   * Adds a player to the trading session.
   * Updates the trade's state to reflect the new player.
   * If the trading session is now full (has two players), updates the trade's state to set the status to IN_PROGRESS.
   *
   * @param player The player to join the trading session
   * @throws InvalidParametersError if the player is already in the trading session (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the trading session is full (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    if (this.state.player1 === player.id || this.state.player2 === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.player1) {
      this.state = {
        ...this.state,
        player1: player.id,
      };
    } else if (!this.state.player2) {
      this.state = {
        ...this.state,
        player2: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }

    if (this.state.player1 && this.state.player2) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

  /**
   * Removes a player from the trading session.
   * Updates the trade's state to reflect the player leaving.
   * If the trading session has two players in it at the time of call to this method,
   *   updates the trade's status to OVER.
   * If the trading session does not yet have two players in it at the time of call to this method,
   *   updates the trade's status to WAITING_TO_START.
   *
   * @param player The player to remove from the trading session
   * @throws InvalidParametersError if the player is not in the trading session (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (this.state.player1 !== player.id && this.state.player2 !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    // Handles case where the trading session has not started yet
    if (this.state.player2 === undefined) {
      this.state = {
        offers: [],
        status: 'WAITING_TO_START',
      };
      return;
    }
    this.state = {
      ...this.state,
      status: 'OVER',
    };
  }
}
