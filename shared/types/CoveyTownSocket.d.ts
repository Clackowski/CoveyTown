export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
}
export type HatType = '' | 'baseball' | 'chef' | 'winter' | 'tophat' | 'cowboy' | 'pirate' | 'wizard' | 'party' | 'viking' | 'special';

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'TicTacToeArea' | 'HatShopArea' | 'HatTradingArea';
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';

export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};

export interface ConversationArea extends Interactable {
  topic?: string;
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
}

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}
/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

export interface TradeOffer<OfferType> {
  playerID: PlayerID;
  tradeID: TradeInstanceID;
  offer: OfferType;
}

export type TicTacToeGridPosition = 0 | 1 | 2;

/**
 * Type for a move in TicTacToe
 */
export interface TicTacToeMove {
  gamePiece: 'X' | 'O';
  row: TicTacToeGridPosition;
  col: TicTacToeGridPosition;
}

/**
 * Type for the state of a TicTacToe game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (x and o)
 * The first player to join the game is x, the second is o
 */
export interface TicTacToeGameState extends WinnableGameState {
  moves: ReadonlyArray<TicTacToeMove>;
  x?: PlayerID;
  o?: PlayerID;
}

export type InteractableID = string;
export type GameInstanceID = string;
export type ShopInstanceID = string;
export type TradeInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

export interface ShopInstance<T extends ShopState> {
  state: T;
  id: ShopInstanceID;
  players: PlayerID[];
}

export interface TradeInstance<T extends TradeState> {
  state: T;
  id: TradeInstanceID;
  players: PlayerID[];
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =  ViewingAreaUpdateCommand | JoinGameCommand | GameMoveCommand<TicTacToeMove> | LeaveGameCommand | JoinShopCommand | LeaveShopCommand | JoinTradeCommand | LeaveTradeCommand | TradeOfferCommand<HatOffer>;
export interface ViewingAreaUpdateCommand  {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}
export interface JoinGameCommand {
  type: 'JoinGame';
}
export interface LeaveGameCommand {
  type: 'LeaveGame';
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: 'GameMove';
  gameID: GameInstanceID;
  move: MoveType;
}
export interface JoinShopCommand {
  type: 'JoinShop';
}
export interface LeaveShopCommand {
  type: 'LeaveShop';
  shopID: ShopInstanceID
}
export interface JoinTradeCommand {
  type: 'JoinTrade';
}
export interface LeaveTradeCommand {
  type: 'LeaveTrade';
  tradeID: TradeInstanceID;
}
export interface TradeOfferCommand<OfferType> {
  type: 'TradeOffer';
  tradeID: TradeInstanceID;
  offer: OfferType;
}

export type InteractableCommandReturnType<CommandType extends InteractableCommand> =
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends GameMoveCommand<TicTacToeMove> ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  CommandType extends JoinShopCommand ? { shopID: string} :
  CommandType extends LeaveShopCommand ? undefined :
  CommandType extends JoinTradeCommand ? { tradeID: string}:
  CommandType extends LeaveTradeCommand ? undefined :
  CommandType extends TradeOfferCommand<HatOffer> ? undefined :
    never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (command: InteractableCommand & InteractableCommandBase) => void;
}

/**
 * Type for a hat
 */
export interface Hat {
  image: string;
  hatID: number;
}

/**
 * Type for a pack in the shop
 */
export interface Pack {
  idx : number;
  map : Map<Hat, float>;
  price: number;
}

// Shop Types
export interface ShopArea<T extends ShopState> extends Interactable {
  shop: ShopInstance<T> | undefined;
}

export type ShopStatus = 'WAITING_TO_START' | 'IN_PROGRESS' | 'OVER';
export interface ShopState {
  status: ShopStatus;
}

export interface HatShopState extends ShopState {
  customer?: PlayerID;
}

// Trade Types
export interface TradingArea<T extends TradeState> extends Interactable {
  trade: TradeInstance<T> | undefined;
}

export type TradeStatus = 'WAITING_TO_START' | 'IN_PROGRESS' | 'OVER';
export interface TradeState {
  status: TradeStatus;
}

export interface TradeSwap<SwapType> {
  playerID: PlayerID;
  tradeID: TradeInstanceID;
  swap: SwapType;
}

export interface HatTradingState extends TradeState {
  offers: ReadonlyArray<HatOffer>;
  player1?: PlayerID;
  player2?: PlayerID;
}

export interface HatOffer {
  playerOfferingHat: 1 | 2;
  hatIDToGive: HatID;
  offerNumber: number;
}

