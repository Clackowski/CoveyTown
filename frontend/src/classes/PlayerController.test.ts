import { nanoid } from "nanoid";``
import { PlayerLocation } from "../types/CoveyTownSocket";
import PlayerController from "./PlayerController";
import PlayerData from "./PlayerData";

describe('test for player inventory', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testPlayer: PlayerController;
  beforeEach(async () => {
    const playerLocation: PlayerLocation = {
      moving: false,
      x: 0,
      y: 0,
      rotation: 'front',
    };
    testPlayer =  new PlayerController(nanoid(), nanoid(), playerLocation);
    // await new PlayerData().addPlayer(testPlayer.userName);
    });

  afterEach(() => {
    //remove from database
  });

  describe('new player', () => {
    it('Returns true if the inventory is initalized to be empty for a new player', () => {
        const inv = testPlayer.inventory;
        expect(inv.size == 0).toBe(true);
    })
  })
})