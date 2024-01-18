import assert from 'assert';
import Phaser from 'phaser';
import PlayerController, { MOVEMENT_SPEED } from '../../classes/PlayerController';
import TownController from '../../classes/TownController';
import { HatType, PlayerLocation } from '../../types/CoveyTownSocket';
import { Callback } from '../VideoCall/VideoFrontend/types';
import Interactable from './Interactable';
import ConversationArea from './interactables/ConversationArea';
import GameArea from './interactables/GameArea';
import Transporter from './interactables/Transporter';
import ViewingArea from './interactables/ViewingArea';
import ShopArea from './interactables/ShopArea';
import PlayerData from '../../classes/PlayerData';
import TradeArea from './interactables/TradeArea';

type Extrakeys = {
  /**
  * A Key object mapping to the one key.
  */
  one: Phaser.Input.Keyboard.Key;
  /**
  * A Key object mapping to the two key.
  */
  two: Phaser.Input.Keyboard.Key; 
  /**
   * A Key object mapping to the three key.
   */
  three: Phaser.Input.Keyboard.Key; 
  /**
   * A Key object mapping to the four key.
   */
  four: Phaser.Input.Keyboard.Key; 
  /**
   * A Key object mapping to the five key.
   */
  five: Phaser.Input.Keyboard.Key; 
  /**
   * A Key object mapping to the six key.
   */
  six: Phaser.Input.Keyboard.Key; 
  /**
   * A Key object mapping to the seven key.
   */
  seven: Phaser.Input.Keyboard.Key; 
  /**
   * A Key object mapping to the eight key.
   */
  eight: Phaser.Input.Keyboard.Key; 
  /**
   * A Key object mapping to the nine key.
   */
  nine: Phaser.Input.Keyboard.Key; 
  /**
   * A Key object mapping to the zero key.
   */
  zero: Phaser.Input.Keyboard.Key;
  /**
   * A Key object mapping to the R key.
   */
  r: Phaser.Input.Keyboard.Key;
}
type MyKeys = Phaser.Types.Input.Keyboard.CursorKeys & Extrakeys;


// Still not sure what the right type is here... "Interactable" doesn't do it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interactableTypeForObjectType(type: string): any {
  if (type === 'ConversationArea') {
    return ConversationArea;
  } else if (type === 'Transporter') {
    return Transporter;
  } else if (type === 'ViewingArea') {
    return ViewingArea;
  } else if (type === 'GameArea') {
    return GameArea;
  } else if (type === 'ShopArea') {
    return ShopArea;
  } else if (type === 'TradeArea') {
    return TradeArea;
  } else {
    throw new Error(`Unknown object type: ${type}`);
  }
}

// Original inspiration and code from:
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
export default class TownGameScene extends Phaser.Scene {
  private _pendingOverlapExits = new Map<Interactable, () => void>();

  addOverlapExit(interactable: Interactable, callback: () => void) {
    this._pendingOverlapExits.set(interactable, callback);
  }

  private _players: PlayerController[] = [];

  private _interactables: Interactable[] = [];

  private _cursors: MyKeys[] = [];

  //private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private _cursorKeys?: MyKeys;

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private _previouslyCapturedKeys: number[] = [];

  private _lastLocation?: PlayerLocation;

  private _ready = false;

  private _paused = false;

  public coveyTownController: TownController;

  private _onGameReadyListeners: Callback[] = [];

  // private _playerData = new PlayerData();

  private _hatFile: string;

  private _invMaping = new Map<number, HatType>();


  // private _playerInv: Map<HatType, number>;

  /**
   * Layers that the player can collide with.
   */
  private _collidingLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private _gameIsReady = new Promise<void>(resolve => {
    if (this._ready) {
      resolve();
    } else {
      this._onGameReadyListeners.push(resolve);
    }
  });

  public get gameIsReady() {
    return this._gameIsReady;
  }

  public get cursorKeys() {
    const ret = this._cursorKeys;
    if (!ret) {
      throw new Error('Unable to access cursors before game scene is loaded');
    }
    return ret;
  }

  //sets the hat field to have the proper annotation for file calling
  public set hatFile(newHat: string) {
    if (newHat == '') {
      this._hatFile = newHat;
    } else {
      this._hatFile = '-' + newHat;
    }
  }

  //get hat field
  public get hatFile(){
    return this._hatFile;
  }

  private _resourcePathPrefix: string;

  constructor(coveyTownController: TownController, resourcePathPrefix = '') {
    super('TownGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.coveyTownController = coveyTownController;
    this._players = this.coveyTownController.players;
    this._hatFile = '';
    this.hatFile = this.coveyTownController.ourPlayer.currentHat;
  }


  preload() {
    this.load.image(
      'Room_Builder_32x32',
      this._resourcePathPrefix + '/assets/tilesets/Room_Builder_32x32.png',
    );
    this.load.image(
      '22_Museum_32x32',
      this._resourcePathPrefix + '/assets/tilesets/22_Museum_32x32.png',
    );
    this.load.image(
      '5_Classroom_and_library_32x32',
      this._resourcePathPrefix + '/assets/tilesets/5_Classroom_and_library_32x32.png',
    );
    this.load.image(
      '12_Kitchen_32x32',
      this._resourcePathPrefix + '/assets/tilesets/12_Kitchen_32x32.png',
    );
    this.load.image(
      '1_Generic_32x32',
      this._resourcePathPrefix + '/assets/tilesets/1_Generic_32x32.png',
    );
    this.load.image(
      '13_Conference_Hall_32x32',
      this._resourcePathPrefix + '/assets/tilesets/13_Conference_Hall_32x32.png',
    );
    this.load.image(
      '14_Basement_32x32',
      this._resourcePathPrefix + '/assets/tilesets/14_Basement_32x32.png',
    );
    this.load.image(
      '16_Grocery_store_32x32',
      this._resourcePathPrefix + '/assets/tilesets/16_Grocery_store_32x32.png',
    );
    this.load.tilemapTiledJSON('map', this._resourcePathPrefix + '/assets/tilemaps/indoors.json');
    this.load.atlas(
      'atlas',
      this._resourcePathPrefix + '/assets/atlas/atlas.png',
      this._resourcePathPrefix + '/assets/atlas/atlas.json',
    );
    this.load.atlas(
      'atlas-baseball',
      this._resourcePathPrefix + '/assets/atlas/atlas-baseball.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-baseball.json',
    );
    this.load.atlas(
      'atlas-chef',
      this._resourcePathPrefix + '/assets/atlas/atlas-chef.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-chef.json',
    );
    this.load.atlas(
      'atlas-wizard',
      this._resourcePathPrefix + '/assets/atlas/atlas-wizard.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-wizard.json',
    );
    this.load.atlas(
      'atlas-winter',
      this._resourcePathPrefix + '/assets/atlas/atlas-winter.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-winter.json',
    );
    this.load.atlas(
      'atlas-tophat',
      this._resourcePathPrefix + '/assets/atlas/atlas-tophat.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-tophat.json',
    );
    this.load.atlas(
      'atlas-cowboy',
      this._resourcePathPrefix + '/assets/atlas/atlas-cowboy.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-cowboy.json',
    );
    this.load.atlas(
      'atlas-pirate',
      this._resourcePathPrefix + '/assets/atlas/atlas-pirate.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-pirate.json',
    );
    this.load.atlas(
      'atlas-viking',
      this._resourcePathPrefix + '/assets/atlas/atlas-viking.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-viking.json',
    );
    this.load.atlas(
      'atlas-party',
      this._resourcePathPrefix + '/assets/atlas/atlas-party.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-party.json',
    );
    this.load.atlas(
      'atlas-special',
      this._resourcePathPrefix + '/assets/atlas/atlas-special.png',
      this._resourcePathPrefix + '/assets/atlas/atlas-special.json',
    );
  }

  updatePlayers(players: PlayerController[]) {
    //Make sure that each player has sprites
    players.map(eachPlayer => this.createPlayerSprites(eachPlayer));

    // Remove disconnected players from board
    const disconnectedPlayers = this._players.filter(
      player => !players.find(p => p.id === player.id),
    );

    disconnectedPlayers.forEach(disconnectedPlayer => {
      if (disconnectedPlayer.gameObjects) {
        const { sprite, label } = disconnectedPlayer.gameObjects;
        if (sprite && label) {
          sprite.destroy();
          label.destroy();
        }
      }
    });
    // Remove disconnected players from list
    this._players = players;
  }

  getNewMovementDirection() {
    if (this._cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this._cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this._cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this._cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  //returns a string of the number key representing inventory selection
  getInventoryActivation() {
    if (this._cursors.find(keySet => keySet.one?.isDown)) {
      return 'one';
    }
    if (this._cursors.find(keySet => keySet.two?.isDown)) {
      return 'two';
    }
    if (this._cursors.find(keySet => keySet.three?.isDown)) {
      return 'three';
    }
    if (this._cursors.find(keySet => keySet.four?.isDown)) {
      return 'four';
    }
    if (this._cursors.find(keySet => keySet.five?.isDown)) {
      return 'five';
    }
    if (this._cursors.find(keySet => keySet.six?.isDown)) {
      return 'six';
    }
    if (this._cursors.find(keySet => keySet.seven?.isDown)) {
      return 'seven';
    }
    if (this._cursors.find(keySet => keySet.eight?.isDown)) {
      return 'eight';
    }
    if (this._cursors.find(keySet => keySet.nine?.isDown)) {
      return 'nine';
    }
    if (this._cursors.find(keySet => keySet.zero?.isDown)) {
      return 'zero';
    }
    if (this._cursors.find(keySet => keySet.r?.isDown)) {
      return 'reset';
    }
    return undefined;
  }

  moveOurPlayerTo(destination: Partial<PlayerLocation>) {
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (!gameObjects) {
      throw new Error('Unable to move player without game objects created first');
    }
    if (!this._lastLocation) {
      this._lastLocation = { moving: false, rotation: 'front', x: 0, y: 0 };
    }
    if (destination.x !== undefined) {
      gameObjects.sprite.x = destination.x;
      this._lastLocation.x = destination.x;
    }
    if (destination.y !== undefined) {
      gameObjects.sprite.y = destination.y;
      this._lastLocation.y = destination.y;
    }
    if (destination.moving !== undefined) {
      this._lastLocation.moving = destination.moving;
    }
    if (destination.rotation !== undefined) {
      this._lastLocation.rotation = destination.rotation;
    }
    this.coveyTownController.emitMovement(this._lastLocation);
  }

  /*
  * Using the information from the player contoller for our player, this method generates the on-screen inventory as well as
  * updates the necessary fields for proper inventory function.
  */
  generateInventory() {
    const inv = this.coveyTownController.ourPlayer.inventory;
    const invMap = new Map<number, HatType>();
    invMap.set(10, '');
    let invString = `Inventory:`;
    let count = 0;
    for (const [hat, quant] of inv) {
      if (hat != '') {
        invString = invString + `\nItem ${count}: ${hat}(${quant})`
        if (quant != 0) {
          invMap.set(count, hat);
        }
        count++;
      }
    }
    invString = invString + '\nReset (r): No Hat' + '\nCoveyCoins: ' + this.coveyTownController.ourPlayer.coveycoins;
    this._invMaping = invMap;
    this.add
      .text(16, 80, invString, {
        font: '12px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10,
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);
  }

  update() {
    if (this._paused) {
      return;
    }

    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (gameObjects && this._cursors) {
      const prevVelocity = gameObjects.sprite.body.velocity.clone();
      const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;

      this.generateInventory();
      this.hatFile = this.coveyTownController.ourPlayer.currentHat;

      //applies the inventory selection to the character model
      const numKeyPress = this.getInventoryActivation();
      let newHat: HatType | undefined;
      switch(numKeyPress) {
        case 'one':
          newHat = this._invMaping.get(1)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'two':
          newHat = this._invMaping.get(2)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'three':
          newHat = this._invMaping.get(3)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'four':
          newHat = this._invMaping.get(4)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'five':
          newHat = this._invMaping.get(5)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'six':
          newHat = this._invMaping.get(6)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'seven':
          newHat = this._invMaping.get(7)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'eight':
          newHat = this._invMaping.get(8)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'nine':
          newHat = this._invMaping.get(9)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'zero':
          newHat = this._invMaping.get(0)
          if (newHat){ this.hatFile = newHat 
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
            this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          };
          break;
        case 'reset':
          newHat = ''
          this.hatFile = newHat 
          gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-${this._lastLocation?.rotation}${this.hatFile}`);
          this.coveyTownController.ourPlayer.updateCurrentHat(newHat);
          break;
        default:
          break;
      }


      // Stop any previous movement from the last frame
      body.setVelocity(0);

      const primaryDirection = this.getNewMovementDirection();
      switch (primaryDirection) {
        case 'left':
          body.setVelocityX(-MOVEMENT_SPEED);
          gameObjects.sprite.anims.play(`misa-left${this.hatFile}-walk`, true);
          break;
        case 'right':
          body.setVelocityX(MOVEMENT_SPEED);
          gameObjects.sprite.anims.play(`misa-right${this.hatFile}-walk`, true);
          break;
        case 'front':
          body.setVelocityY(MOVEMENT_SPEED);
          gameObjects.sprite.anims.play(`misa-front${this.hatFile}-walk`, true);
          break;
        case 'back':
          body.setVelocityY(-MOVEMENT_SPEED);
          gameObjects.sprite.anims.play(`misa-back${this.hatFile}-walk`, true);
          break;
        default:
          // Not moving
          gameObjects.sprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-left${this.hatFile}`);
          } else if (prevVelocity.x > 0) {
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-right${this.hatFile}`);
          } else if (prevVelocity.y < 0) {
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-back${this.hatFile}`);
          } else if (prevVelocity.y > 0) {
            gameObjects.sprite.setTexture(`atlas${this.hatFile}`, `misa-front${this.hatFile}`);
          }
          break;
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      gameObjects.sprite.body.velocity.normalize().scale(MOVEMENT_SPEED);

      const isMoving = primaryDirection !== undefined;
      gameObjects.label.setX(body.x);
      gameObjects.label.setY(body.y - 20);
      const x = gameObjects.sprite.getBounds().centerX;
      const y = gameObjects.sprite.getBounds().centerY;
      //Move the sprite
      if (
        !this._lastLocation ||
        (isMoving && this._lastLocation.rotation !== primaryDirection) ||
        this._lastLocation.moving !== isMoving
      ) {
        if (!this._lastLocation) {
          this._lastLocation = {
            x,
            y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this._lastLocation.x = x;
        this._lastLocation.y = y;
        this._lastLocation.rotation = primaryDirection || this._lastLocation.rotation || 'front';
        this._lastLocation.moving = isMoving;
        this._pendingOverlapExits.forEach((cb, interactable) => {
          if (
            !Phaser.Geom.Rectangle.Overlaps(
              interactable.getBounds(),
              gameObjects.sprite.getBounds(),
            )
          ) {
            this._pendingOverlapExits.delete(interactable);
            cb();
          }
        });
        this.coveyTownController.emitMovement(this._lastLocation);
      }

      //Update the location for the labels of all of the other players
      for (const player of this._players) {
        if (player.gameObjects?.label && player.gameObjects?.sprite.body) {
          player.gameObjects.label.setX(player.gameObjects.sprite.body.x);
          player.gameObjects.label.setY(player.gameObjects.sprite.body.y - 20);
        }
      }
    }
  }

  private _map?: Phaser.Tilemaps.Tilemap;

  public get map(): Phaser.Tilemaps.Tilemap {
    const map = this._map;
    if (!map) {
      throw new Error('Cannot access map before it is initialized');
    }
    return map;
  }

  getInteractables(): Interactable[] {
    const typedObjects = this.map.filterObjects('Objects', obj => obj.type !== '');
    assert(typedObjects);
    const gameObjects = this.map.createFromObjects(
      'Objects',
      typedObjects.map(obj => ({
        id: obj.id,
        classType: interactableTypeForObjectType(obj.type),
      })),
    );

    return gameObjects as Interactable[];
  }

  create() {
    this._map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
         tileset image in Phaser's cache (i.e. the name you used in preload)
         */
    const tileset = [
      'Room_Builder_32x32',
      '22_Museum_32x32',
      '5_Classroom_and_library_32x32',
      '12_Kitchen_32x32',
      '1_Generic_32x32',
      '13_Conference_Hall_32x32',
      '14_Basement_32x32',
      '16_Grocery_store_32x32',
    ].map(v => {
      const ret = this.map.addTilesetImage(v);
      assert(ret);
      return ret;
    });

    this._collidingLayers = [];
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = this.map.createLayer('Below Player', tileset, 0, 0);
    assert(belowLayer);
    belowLayer.setDepth(-10);
    const wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
    const onTheWallsLayer = this.map.createLayer('On The Walls', tileset, 0, 0);
    assert(wallsLayer);
    assert(onTheWallsLayer);
    wallsLayer.setCollisionByProperty({ collides: true });
    onTheWallsLayer.setCollisionByProperty({ collides: true });

    const worldLayer = this.map.createLayer('World', tileset, 0, 0);
    assert(worldLayer);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = this.map.createLayer('Above Player', tileset, 0, 0);
    assert(aboveLayer);
    aboveLayer.setCollisionByProperty({ collides: true });

    const veryAboveLayer = this.map.createLayer('Very Above Player', tileset, 0, 0);
    assert(veryAboveLayer);
    /* By default, everything gets depth sorted on the screen in the order we created things.
         Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
         it a depth. Higher depths will sit on top of lower depth objects.
         */
    worldLayer.setDepth(5);
    aboveLayer.setDepth(10);
    veryAboveLayer.setDepth(15);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    ) as unknown as Phaser.GameObjects.Components.Transform;

    const labels = this.map.filterObjects('Objects', obj => obj.name === 'label');
    labels?.forEach(label => {
      if (label.x && label.y) {
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        });
      }
    });

    assert(this.input.keyboard);
    this._cursorKeys = this.input.keyboard.createCursorKeys() as unknown as MyKeys;
    this._cursors.push(this._cursorKeys);
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
          one: Phaser.Input.Keyboard.KeyCodes.ONE
        },
        false,
      ) as MyKeys,
    );
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.H,
          down: Phaser.Input.Keyboard.KeyCodes.J,
          left: Phaser.Input.Keyboard.KeyCodes.K,
          right: Phaser.Input.Keyboard.KeyCodes.L,
        },
        false,
      ) as MyKeys,
    );
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          one: Phaser.Input.Keyboard.KeyCodes.ONE,
          two: Phaser.Input.Keyboard.KeyCodes.TWO,
          three: Phaser.Input.Keyboard.KeyCodes.THREE,
          four: Phaser.Input.Keyboard.KeyCodes.FOUR,
          five: Phaser.Input.Keyboard.KeyCodes.FIVE,
          six: Phaser.Input.Keyboard.KeyCodes.SIX,
          seven: Phaser.Input.Keyboard.KeyCodes.SEVEN,
          eight: Phaser.Input.Keyboard.KeyCodes.EIGHT,
          nine: Phaser.Input.Keyboard.KeyCodes.NINE,
          zero: Phaser.Input.Keyboard.KeyCodes.ZERO,
          r: Phaser.Input.Keyboard.KeyCodes.R
        },
        false,
      ) as MyKeys,
    );

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, `atlas${this.hatFile}`, `misa-front${this.hatFile}`)
      .setSize(30, 40)
      .setOffset(0, 24)
      .setDepth(6);
    const label = this.add
      .text(spawnPoint.x, spawnPoint.y, '', {
        font: '8px monospace',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 3
        // padding: {x: 20, y: 10},
        // backgroundColor: '#ffffff',
      })
      .setDepth(6);
    this.coveyTownController.ourPlayer.gameObjects = {
      sprite,
      label,
      locationManagedByGameScene: true,
    };

    this.coveyTownController.ourPlayer.updateLocalInventory();

    //Load the initial inventory
    this.generateInventory();

    this._interactables = this.getInteractables();

    this.moveOurPlayerTo({ rotation: 'front', moving: false, x: spawnPoint.x, y: spawnPoint.y });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this._collidingLayers.push(worldLayer);
    this._collidingLayers.push(wallsLayer);
    this._collidingLayers.push(aboveLayer);
    this._collidingLayers.push(onTheWallsLayer);
    this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const { anims } = this;
    for (const loadHat of ['-baseball', '', '-chef', '-wizard', '-winter', '-tophat', '-pirate', '-viking', '-party', '-special', '-cowboy']) {
    anims.create({
        key: `misa-left${loadHat}-walk`,
        frames: anims.generateFrameNames(`atlas${loadHat}`, {
          prefix: `misa-left${loadHat}-walk.`,
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
        key: `misa-right${loadHat}-walk`,
        frames: anims.generateFrameNames(`atlas${loadHat}`, {
          prefix: `misa-right${loadHat}-walk.`,
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
        key: `misa-front${loadHat}-walk`,
        frames: anims.generateFrameNames(`atlas${loadHat}`, {
          prefix: `misa-front${loadHat}-walk.`,
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
        key: `misa-back${loadHat}-walk`,
        frames: anims.generateFrameNames(`atlas${loadHat}`, {
          prefix: `misa-back${loadHat}-walk.`,
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    };

    const camera = this.cameras.main;
    camera.startFollow(this.coveyTownController.ourPlayer.gameObjects.sprite);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move`, {
        font: '18px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10,
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    this._ready = true;
    this.updatePlayers(this.coveyTownController.players);
    // Call any listeners that are waiting for the game to be initialized
    this._onGameReadyListeners.forEach(listener => listener());
    this._onGameReadyListeners = [];
    this.coveyTownController.addListener('playersChanged', players => this.updatePlayers(players));
  }

  createPlayerSprites(player: PlayerController) {
    if (!player.gameObjects) {
      const sprite = this.physics.add
        .sprite(player.location.x, player.location.y, `atlas${this.hatFile}`, `misa-front${this.hatFile}`)
        .setSize(30, 40)
        .setOffset(0, 24);
      const label = this.add.text(
        player.location.x,
        player.location.y,
        player === this.coveyTownController.ourPlayer ? '(You)' : player.userName,
        {
          font: '8px monospace',
          color: '#000000',
          // padding: {x: 20, y: 10},
          backgroundColor: '#ffffff',
        },
      )
      player.gameObjects = {
        sprite,
        label,
        locationManagedByGameScene: false,
      };
      this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
    }
  }

  pause() {
    if (!this._paused) {
      this._paused = true;
      const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
      if (gameObjects) {
        gameObjects.sprite.anims.stop();
        const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
      }
      assert(this.input.keyboard);
      this._previouslyCapturedKeys = this.input.keyboard.getCaptures();
      this.input.keyboard.clearCaptures();
    }
  }

  resume() {
    if (this._paused) {
      this._paused = false;
      if (this.input && this.input.keyboard) {
        this.input.keyboard.addCapture(this._previouslyCapturedKeys);
      }
      this._previouslyCapturedKeys = [];
    }
  }
}
