import Player from '../../lib/Player';
import {
  ShopArea as ShopAreaModel,
  InteractableType,
  ShopState,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Shop from './Shop';

/**
 * A ShopArea is an InteractableArea on the map that supports a shop.
 */
export default abstract class ShopArea<ShopType extends Shop<ShopState>> extends InteractableArea {
  protected _shop?: ShopType;

  public get shop(): ShopType | undefined {
    return this._shop;
  }

  public toModel(): ShopAreaModel<ShopType['state']> {
    return {
      id: this.id,
      shop: this._shop?.toModel(),
      occupants: this.occupantsByID,
      type: this.getType(),
    };
  }

  public get isActive(): boolean {
    return true;
  }

  protected abstract getType(): InteractableType;

  public remove(player: Player): void {
    if (this._shop) {
      this._shop.leave(player);
    }
    super.remove(player);
  }
}
