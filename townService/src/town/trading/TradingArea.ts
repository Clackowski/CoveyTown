import Player from '../../lib/Player';
import {
  TradingArea as TradingAreaModel,
  InteractableType,
  TradeState,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Trade from './Trade';

/**
 * A TradingArea is an InteractableArea on the map that can host a trading session.
 * At any given point in time, there is at most one trading session in progress in a TradingArea.
 */
export default abstract class TradingArea<
  TradeType extends Trade<TradeState, unknown>,
> extends InteractableArea {
  protected _trade?: TradeType;

  public get trade(): TradeType | undefined {
    return this._trade;
  }

  public toModel(): TradingAreaModel<TradeType['state']> {
    return {
      id: this.id,
      trade: this._trade?.toModel(),
      occupants: this.occupantsByID,
      type: this.getType(),
    };
  }

  public get isActive(): boolean {
    return true;
  }

  protected abstract getType(): InteractableType;

  public remove(player: Player): void {
    if (this._trade) {
      this._trade.leave(player);
    }
    super.remove(player);
  }
}
