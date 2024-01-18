import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  Hat,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  Pack,
} from '../../types/CoveyTownSocket';
import ShopArea from './ShopArea';
import HatShop from './HatShop';

/**
 * A HatShopArea is a ShopArea that hosts a HatShop.
 * @see HatShop
 * @see ShopArea
 */
export default class HatShopArea extends ShopArea<HatShop> {
  protected getType(): InteractableType {
    return 'HatShopArea';
  }

  private _stateUpdated() {
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this shop area.
   * Supported commands:
   * - JoinShop (joins the shop `this._shop`, or creates a new one if none is in progress)
   * - BuyFromShop (applies a purchase to the shop)
   * - LeaveShop (leaves the shop)
   *
   * If the command is successful (does not throw an error), calls this._emitAreaChanged
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveShop and BuyFromShop: No shop in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or shopID does not match the shop in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveShop, BuyFromShop and JoinShop: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinShop') {
      let shop = this._shop;
      if (!shop || shop.state.status === 'OVER') {
        // Create pack array from hats and probabilities
        shop = new HatShop();
        /* const packs: Pack[] = this._initPacks();

        // Make a new shop
        shop = new HatShop(player, packs); */
        this._shop = shop;
      }
      shop.join(player);
      this._stateUpdated();
      return { shopID: shop.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveShop') {
      const shop = this._shop;
      if (!shop) {
        throw new Error('Shop does not exist');
        // throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._shop?.id !== command.shopID) {
        throw new Error('Shop ID missmatch message');
        // throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }

      shop.leave(player);
      this._stateUpdated();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  // Functions will need to be moved somewhere else since they will be needed in other parts of the code.
  private _initHats(): Hat[] {
    const hat0: Hat = {
      image: 'image0.png',
      hatID: 0,
    };

    const hat1: Hat = {
      image: 'image1.png',
      hatID: 1,
    };

    const hat2: Hat = {
      image: 'image2.png',
      hatID: 2,
    };

    const hat3: Hat = {
      image: 'image3.png',
      hatID: 3,
    };

    return [hat0, hat1, hat2, hat3];
  }

  private _initPacks(): Pack[] {
    const allHats: Hat[] = this._initHats();

    const map0 = new Map();
    map0.set(allHats[0], 0.25);
    map0.set(allHats[1], 0.75);

    const map1 = new Map();
    map1.set(allHats[0], 0.25);
    map1.set(allHats[2], 0.4);
    map1.set(allHats[3], 0.35);

    const map2 = new Map();
    map1.set(allHats[2], 0.2);
    map1.set(allHats[3], 0.8);

    const pack0: Pack = {
      idx: 0,
      map: map0,
      price: 20,
    };

    const pack1: Pack = {
      idx: 1,
      map: map1,
      price: 50,
    };

    const pack2: Pack = {
      idx: 2,
      map: map2,
      price: 100,
    };

    return [pack0, pack1, pack2];
  }
}
