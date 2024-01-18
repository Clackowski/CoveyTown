import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { HatShopState } from '../../types/CoveyTownSocket';
import Shop from './Shop';

/**
 * A HatShop is a Shop that implements buying hats.
 */
export default class HatShop extends Shop<HatShopState> {
  public constructor() {
    super({
      status: 'WAITING_TO_START',
    });
  }

  /**
   * Adds a player to the shop.
   * Updates the shop's state to reflect the new player.
   * If the shop is now full, updates the shop's state to set the status to IN_PROGRESS.
   *
   * @param player The player to join the shop
   * @throws InvalidParametersError if the player is already in the shop (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the shop is full (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    if (this.state.customer === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.customer) {
      this.state = {
        ...this.state,
        customer: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.customer) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

  /**
   * Removes a player from the shop.
   * Updates the shop's state to reflect the player leaving.
   * If the shop has a player in it at the time of call to this method,
   *   updates the shop's status to OVER.
   * If the shop does not yet have a player in it at the time of call to this method,
   *   updates the shop's status to WAITING_TO_START.
   *
   * @param player The player to remove from the shop
   * @throws InvalidParametersError if the player is not in the shop (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (this.state.customer !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    if (this.state.customer === player.id) {
      this.state = {
        ...this.state,
        status: 'OVER',
      };
    }
  }
}
