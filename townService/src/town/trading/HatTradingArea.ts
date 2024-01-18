import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import TradingArea from './TradingArea';
import HatTrading from './HatTrading';

/**
 * A HatTradingArea is a TradingArea that hosts HatTrading.
 * @see HatTrading
 * @see TradingArea
 */
export default class HatTradingArea extends TradingArea<HatTrading> {
  protected getType(): InteractableType {
    return 'HatTradingArea';
  }

  private _stateUpdated() {
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this trade area.
   * Supported commands:
   * - JoinTrade (joins the trade `this._trade`, or creates a new one if none is in progress)
   * - TradeOffer (applies an offer to the trading area)
   * - LeaveTrade (leaves the trade)
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
   *  - LeaveTrade and TradeOffer: No Trade in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or tradeID does not match the trade in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveTrade, TradeOffer and JoinTrade: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'TradeOffer') {
      const trade = this._trade;
      if (!trade) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._trade?.id !== command.tradeID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      trade.performTrade({
        playerID: player.id,
        tradeID: command.tradeID,
        offer: command.offer,
      });
      this._stateUpdated();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinTrade') {
      let { trade } = this;
      if (!trade || trade.state.status === 'OVER') {
        // No trade in progress, make a new one
        trade = new HatTrading();
        this._trade = trade;
      }
      trade.join(player);
      this._stateUpdated();
      return { tradeID: trade.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveTrade') {
      const trade = this._trade;
      if (!trade) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this.trade?.id !== command.tradeID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      trade.leave(player);
      this._stateUpdated();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
