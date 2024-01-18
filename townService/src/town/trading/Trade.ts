import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import {
  TradeInstance,
  TradeInstanceID,
  TradeOffer,
  TradeState,
} from '../../types/CoveyTownSocket';

/**
 * This class is the base class for all trades. It is responsible for managing the
 * state of the trade. @see TradeArea
 */
export default abstract class Trade<StateType extends TradeState, OfferType> {
  private _state: StateType;

  public readonly id: TradeInstanceID;

  protected _players: Player[] = [];

  /**
   * Creates a new Trade instance.
   * @param initialState State to initialize the trade with.
   * @param emitAreaChanged A callback to invoke when the state of the trade changes. This is used to notify clients.
   */
  public constructor(initialState: StateType) {
    this.id = nanoid() as TradeInstanceID;
    this._state = initialState;
  }

  public get state() {
    return this._state;
  }

  protected set state(newState: StateType) {
    this._state = newState;
  }

  /**
   * Apply an offer to the trading session.
   * This method should be implemented by subclasses.
   * @param offer An offer to apply to the trading session.
   * @throws InvalidParametersError if the offer is invalid.
   */
  public abstract performTrade(offer: TradeOffer<OfferType>): void;

  /**
   * Attempt to join a trade.
   * This method should be implemented by subclasses.
   * @param player The player to join the trade.
   * @throws InvalidParametersError if the player can not join the trade
   */
  protected abstract _join(player: Player): void;

  /**
   * Attempt to leave a trade.
   * This method should be implemented by subclasses.
   * @param player The player to leave the trade.
   * @throws InvalidParametersError if the player can not leave the trade
   */
  protected abstract _leave(player: Player): void;

  /**
   * Attempt to join a trade.
   * @param player The player to join the trade.
   * @throws InvalidParametersError if the player can not join the trade
   */
  public join(player: Player): void {
    this._join(player);
    this._players.push(player);
  }

  /**
   * Attempt to leave a trade.
   * @param player The player to leave the trade.
   * @throws InvalidParametersError if the player can not leave the trade
   */
  public leave(player: Player): void {
    this._leave(player);
    this._players = this._players.filter(p => p.id !== player.id);
  }

  public toModel(): TradeInstance<StateType> {
    return {
      state: this._state,
      id: this.id,
      players: this._players.map(player => player.id),
    };
  }
}
