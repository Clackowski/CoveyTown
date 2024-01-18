import _ from 'lodash';
import {
  InteractableID,
  TradeInstanceID,
  TradeState,
  TradingArea,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import PlayerData from "../PlayerData";

export type TradeEventTypes = BaseInteractableEventMap & {
  tradeStart: () => void;
  tradeUpdated: () => void;
  tradeEnd: () => void;
  playersChange: (newPlayers: PlayerController[]) => void;
};

/**
 * This class is the base class for all trade controllers. It is responsible for managing the
 * state of the trade, and for sending commands to the server to update the state of the trade.
 * It is also responsible for notifying the UI when the state of the trade changes, by emitting events.
 */
export default abstract class TradingAreaController<
  State extends TradeState,
  EventTypes extends TradeEventTypes,
> extends InteractableAreaController<EventTypes, TradingArea<State>> {
  protected _instanceID?: TradeInstanceID;

  protected _townController: TownController;

  protected _model: TradingArea<State>;

  protected _players: PlayerController[] = [];

  constructor(id: InteractableID, tradingArea: TradingArea<State>, townController: TownController) {
    super(id);
    this._model = tradingArea;
    this._townController = townController;

    const trade = tradingArea.trade;
    if (trade && trade.players)
      this._players = trade.players.map(playerID => this._townController.getPlayer(playerID));
  }

  get players(): PlayerController[] {
    return this._players;
  }

  public get observers(): PlayerController[] {
    return this.occupants.filter(eachOccupant => !this._players.includes(eachOccupant));
  }

  /**
   * Sends a request to the server to join the current trade in the trading area, or create a new one if there is no trade in progress.
   *
   * @throws An error if the server rejects the request to join the trade.
   */
  public async joinTrade() {
    const { tradeID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinTrade',
    });
    this._instanceID = tradeID;
  }

  /**
   * Sends a request to the server to leave the current trade in the trading area.
   */
  public async leaveTrade() {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveTrade',
        tradeID: instanceID,
      });
    }
  }

  protected _updateFrom(newModel: TradingArea<State>): void {
    const tradeEnding =
      this._model.trade?.state.status === 'IN_PROGRESS' && newModel.trade?.state.status === 'OVER';
    const newPlayers =
      newModel.trade?.players.map(playerID => this._townController.getPlayer(playerID)) ?? [];
    if (!newPlayers && this._players.length > 0) {
      this._players = [];
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', []);
    }
    if (
      this._players.length != newModel.trade?.players.length ||
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
    this.emit('tradeUpdated');
    this._instanceID = newModel.trade?.id ?? this._instanceID;
    if (tradeEnding) {
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('tradeEnd');
    }
  }

  toInteractableAreaModel(): TradingArea<State> {
    return this._model;
  }
}
