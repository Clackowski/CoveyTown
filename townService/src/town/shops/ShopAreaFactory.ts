import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { BoundingBox, TownEmitter } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import HatShopArea from './HatShopArea';

/**
 * Creates a new ShopArea from a map object
 * @param mapObject the map object to create the shop area from
 * @param broadcastEmitter a broadcast emitter that can be used to emit updates to players
 * @returns the interactable area
 * @throws an error if the map object is malformed
 */
export default function ShopAreaFactory(
  mapObject: ITiledMapObject,
  broadcastEmitter: TownEmitter,
): InteractableArea {
  const { name, width, height } = mapObject;
  if (!width || !height) {
    throw new Error(`Malformed viewing area ${name}`);
  }
  const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
  const shopType = mapObject.properties?.find(prop => prop.name === 'type')?.value;
  if (shopType === 'Hat') {
    return new HatShopArea(name, rect, broadcastEmitter);
  }
  throw new Error(`Unknown shop area type ${mapObject.class}`);
}
