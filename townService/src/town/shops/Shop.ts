import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import { ShopInstance, ShopInstanceID, ShopState } from '../../types/CoveyTownSocket';

/**
 * This class is the base class for all shops. It is responsible for managing the
 * state of the shop. @see ShopArea
 */
export default abstract class Shop<StateType extends ShopState> {
  private _state: StateType;

  public readonly id: ShopInstanceID;

  protected _players: Player[] = [];

  /**
   * Creates a new Shop instance.
   * @param initialState State to initialize the shop with.
   * @param emitAreaChanged A callback to invoke when the state of the shop changes. This is used to notify clients.
   */
  public constructor(initialState: StateType) {
    this.id = nanoid() as ShopInstanceID;
    this._state = initialState;
  }

  public get state() {
    return this._state;
  }

  protected set state(newState: StateType) {
    this._state = newState;
  }

  /**
   * Attempt to join a shop.
   * This method should be implemented by subclasses.
   * @param player The player to join the shop.
   * @throws InvalidParametersError if the player can not join the shop
   */
  protected abstract _join(player: Player): void;

  /**
   * Attempt to leave a shop.
   * This method should be implemented by subclasses.
   * @param player The player to leave the shop.
   * @throws InvalidParametersError if the player can not leave the shop
   */
  protected abstract _leave(player: Player): void;

  /**
   * Attempt to join a shop.
   * @param player The player to join the shop.
   * @throws InvalidParametersError if the player can not join the shop
   */
  public join(player: Player): void {
    this._join(player);
    this._players.push(player);
  }

  /**
   * Attempt to leave a shop.
   * @param player The player to leave the shop.
   * @throws InvalidParametersError if the player can not leave the shop
   */
  public leave(player: Player): void {
    this._leave(player);
    this._players = this._players.filter(p => p.id !== player.id);
  }

  public toModel(): ShopInstance<StateType> {
    return {
      state: this._state,
      id: this.id,
      players: this._players.map(player => player.id),
    };
  }
}
