import _ from 'lodash';
import { HatShopState, ShopArea, ShopStatus } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import ShopAreaController, { ShopEventTypes } from './ShopAreaController';
import PlayerData from "../PlayerData";

export const NO_SHOP_IN_PROGRESS_ERROR = 'No shop in progress';


/**
 * This class is responsible for managing the state of the Hat Shop, and for sending commands to the server
 */
export default class HatAreaController extends ShopAreaController<HatShopState, ShopEventTypes> {

  /**
   * Returns the customer, if there is one, or undefined otherwise
   */
  get customer(): PlayerController | undefined {
    const customer = this._model.shop?.state.customer;
    if (customer) {
      return this.occupants.find(eachOccupant => eachOccupant.id === customer);
    }
    return undefined;
  }

  /**
   * Returns true if the current player is a customer in this shop
   */
  get isPlayer(): boolean {
    return this._model.shop?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Returns the status of the shop.
   * Defaults to 'WAITING_TO_START' if the shop is not in progress
   */
  get status(): ShopStatus {
    const status = this._model.shop?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Returns true if the shop is in progress
   */
  public isActive(): boolean {
    return this._model.shop?.state.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this HatAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this shop area and
   * other common properties (including this._model).
   *
   * If the purchases list has changed, emits a 'purchasesChanged' event with the new purchases. If the purchases list has not changed,
   *  does not emit the event.
   *
   */
  protected _updateFrom(newModel: ShopArea<HatShopState>): void {
    super._updateFrom(newModel);
  }

  /**
   * Sends a request to the server to make a purchase
   *
   * If the shop is not in progress, throws an error NO_SHOP_IN_PROGRESS_ERROR
   *
   * @param packIndex Index of pack that is being purchased
   * @param price Amount of coins required to make a purchase
   */
  public async purchasePack(packIndex: number, price: number) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.shop?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_SHOP_IN_PROGRESS_ERROR);
    }
    const playerData = new PlayerData();
    const allPlayers = await playerData.getAllPlayers();
    let customerCoins = 0;
    for (let i = 0; i < allPlayers.length; i++) {

      if (allPlayers[i].username === this.customer?.userName) {
        customerCoins = await playerData.getCoinCount(allPlayers[i].username);
      }
    }

    if (customerCoins < price) {
      throw new Error('Not enough coins');
    }

    const randomNumber = Math.random();
    let hatBought = '';

    if (packIndex === 0 && this.customer?.userName) {
      if (randomNumber < 0.39) {
        hatBought = 'baseball';
      } else if (randomNumber < 0.69) {
        hatBought = 'chef';
      } else if (randomNumber < 0.89) {
        hatBought = 'winter';
      } else {
        hatBought = 'cowboy';
      }
    } else if (packIndex === 1 && this.customer?.userName) {
      if (randomNumber < 0.39) {
        hatBought = 'cowboy';
      } else if (randomNumber < 0.69) {
        hatBought = 'pirate';
      } else if (randomNumber < 0.89) {
        hatBought = 'tophat';
      } else {
        hatBought = 'wizard';
      }
    } else if (packIndex === 2 && this.customer?.userName) {
      if (randomNumber < 0.39) {
        hatBought = 'wizard';
      } else if (randomNumber < 0.69) {
        hatBought = 'party';
      } else if (randomNumber < 0.94) {
        hatBought = 'viking';
      } else {
        hatBought = 'special';
      }
    }

    if (this.customer?.userName) {
      await playerData.addHat(this.customer?.userName, hatBought);
      await playerData.addCoveyCoin(this.customer?.userName, -1 * price);
      await this.customer.updateLocalInventory();
      return hatBought;
    } else {
      throw new Error ('No customer in shop');
    }
  }
}
