/**
 * A class filled with fetch functions for convenience. If data is needed from database
 * these functions can be used to fetch the data.
 */
export default class PlayerData {
  // Returns a list of all players in the database and their information
  async getAllPlayers() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata`);
    const result = await response.json();
    return result;
  }

  /**
   * Returns the given user's last collection date in a string
   * formatted like so: YYYY-MM-DDTHH:mm:SS.[3 digits Milliseconds]Z
   * Where Y=year, M=Month, D=Day, T=T, H=Hour, m=Minute, S=Second, and Z marks it as UTC
   * Example: 2023-11-21T18:35:13.007Z
   * The date given is always from UTC (Coordinated Universal Time)
   * @param username is player's username
   * @returns the given user's last collection date in a string
   */
  async getCollectDate(username: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/collectdate`,
    );
    const result = await response.json();
    return result.dailyCoinsCollectedOn;
  }

  /**
   *
   * @param username is player's username
   * @returns undefined. Still works though.
   */
  async setCollectDate(username: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/collectdate`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = await response.json();
    return result.rowsAffected;
  }

  /**
   *
   * @param username is player's username
   * @returns the amount of Covey coins the given player currently possesses
   */
  async getCoinCount(username: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/coveycoins`,
    );
    const result = await response.json();
    return result.coveyCoinsAmount;
  }
  


  /**
   * Adds the amount given to the given player's covey coins.
   * Give a negative value to remove CoveyCoins.
   * Will not reduce below zero, but also will not throw an error if you try.
   * @param username is player's username
   * @param amount the amount added to the player's covey coins
   * @returns undefined. It works though
   */
  async addCoveyCoin(username: string, amount: integer) {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL
      }/playerdata/${username}/coveycoins/${amount.toString()}`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = await response.json();
    return result.rowsAffected;
  }

  /**
   *
   * @param username is player's username
   * @returns the string of the hat that the player is currently wearing.
   */
  async getActiveHat(username: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/activehat`,
    );
    const result = await response.json();
    return result.currentHat;
  }

  /**
   *
   * @param username is player's username
   * @param hat is the new current hat
   * @returns undefined. Still works though.
   */
  async setActiveHat(username: string, hat: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/activehat/${hat}`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = await response.json();
    return result.rowsAffected;
  }

  /**
   *
   * @param username is player's username
   * @returns Returns a hashmap of {hatString : quantity} pairs that represent
   *          the amount of each type of hat a player has.
   */
  async getInventory(username: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/inventory`,
    );
    const result = await response.json();
    return result;
  }

  /**
   *
   * @param username is player's username
   * @param hat is the hat id of which you are fetching its quantity from a given username
   * @returns Returns the amount of the type of given hat that the given player has
   */
  async getHatQuantity(username: string, hat: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/hat/${hat}`,
    );
    const result = await response.json();
    return result[hat];
  }

  /**
   * Adds a player to the database with these default values:
   * username = given username
   * coveyCoinsAmount = 0
   * dailyCoinsCollectedOn = null (this is the date they last collected daily coins)
   * currentHat = 'noHat'
   * {insert hat name here} = 0
   *
   * @param username is player's username
   * @returns a 1 if successful. Returns undefined if the user is already in the database or something went wrong.
   */
  async addPlayer(username: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = await response.json();
    return result.rowsAffected;
  }

  /**
   * Adds a hat to the player's inventory (by adding 1 to the corresponding field in the table)
   * @param username is player's username
   * @param hat is the hat id of the hat you are adding to the player's inventory
   * @returns a 1 if successful. Anything else means something went wrong.
   */
  async addHat(username: string, hat: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/hat/${hat}`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = await response.json();
    return result.rowsAffected;
  }

  /**
   * Removes a hat from the player's inventory (by subtracting 1 to the corresponding field in the table)
   * @param username is player's username
   * @param hat is the hat id of the hat you are removing from player's inventory
   * @returns a 1 if successful. Returns undefined if remove was attempted on a hat that the player does not own.
   * i.e. a player can't have negative hats.
   */
  async removeHat(username: string, hat: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/playerdata/${username}/hat/${hat}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = await response.json();
    return result.rowsAffected;
  }
}
