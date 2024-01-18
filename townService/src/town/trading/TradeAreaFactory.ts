import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { BoundingBox, TownEmitter } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import HatTradingArea from './HatTradingArea';

/**
 * Creates a new TradeArea from a map object
 * @param mapObject the map object to create the trade area from
 * @param broadcastEmitter a broadcast emitter that can be used to emit updates to players
 * @returns the interactable area
 * @throws an error if the map object is malformed
 */
export default function TradeAreaFactory(
  mapObject: ITiledMapObject,
  broadcastEmitter: TownEmitter,
): InteractableArea {
  const { name, width, height } = mapObject;
  if (!width || !height) {
    throw new Error(`Malformed viewing area ${name}`);
  }
  const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
  const tradeType = mapObject.properties?.find(prop => prop.name === 'type')?.value;
  if (tradeType === 'Trade') {
    return new HatTradingArea(name, rect, broadcastEmitter);
  }
  throw new Error(`Unknown trade area type ${mapObject.class}`);
}
