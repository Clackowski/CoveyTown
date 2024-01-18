import _ from 'lodash';
import { InteractableID, ShopArea, ShopInstanceID, ShopState } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

export type ShopEventTypes = BaseInteractableEventMap & {
  shopStart: () => void;
  shopUpdated: () => void;
  shopEnd: () => void;
  customersChange: (newCustomers: PlayerController[]) => void;
};

/**
 * This class is the base class for all shop controllers. It is responsible for managing the
 * state of the shop, and for sending commands to the server to update the state of the shop.
 * It is also responsible for notifying the UI when the state of the shop changes, by emitting events.
 */
export default abstract class ShopAreaController<
  State extends ShopState,
  EventTypes extends ShopEventTypes,
> extends InteractableAreaController<EventTypes, ShopArea<State>> {
  protected _instanceID?: ShopInstanceID;

  protected _townController: TownController;

  protected _model: ShopArea<State>;

  protected _players: PlayerController[] = [];

  constructor(id: InteractableID, shopArea: ShopArea<State>, townController: TownController) {
    super(id);
    this._model = shopArea;
    this._townController = townController;

    const shop = shopArea.shop;
    if (shop && shop.players)
      this._players = shop.players.map((playerID: string) =>
        this._townController.getPlayer(playerID),
      );
  }

  get players(): PlayerController[] {
    return this._players;
  }

  public get observers(): PlayerController[] {
    return this.occupants.filter(eachOccupant => !this._players.includes(eachOccupant));
  }

  /**
   * Sends a request to the server to join the current shop in the shop area, or create a new one if there is no shop in progress.
   *
   * @throws An error if the server rejects the request to join the shop.
   */
  public async joinShop() {
    const { shopID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinShop',
    });
    this._instanceID = shopID;
  }

  /**
   * Sends a request to the server to leave the current shop in the shop area.
   */
  public async leaveShop() {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveShop',
        shopID: instanceID,
      });
    }
  }

  protected _updateFrom(newModel: ShopArea<State>): void {
    const shopEnding =
      this._model.shop?.state.status === 'IN_PROGRESS' && newModel.shop?.state.status === 'OVER';
    const newPlayers =
      newModel.shop?.players.map((playerID: string) => this._townController.getPlayer(playerID)) ??
      [];
    if (!newPlayers && this._players.length > 0) {
      this._players = [];
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', []);
    }
    if (
      this._players.length != newModel.shop?.players.length ||
      _.xor(newPlayers, this._players).length > 0
    ) {
      this._players = newPlayers;
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', newPlayers);
    }
    this._model = newModel;
    //TODO - Bounty for figuring out how to make the types work here
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('shopUpdated');
    this._instanceID = newModel.shop?.id ?? this._instanceID;
    if (shopEnding) {
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('shopEnd');
    }
  }

  toInteractableAreaModel(): ShopArea<State> {
    return this._model;
  }
}
