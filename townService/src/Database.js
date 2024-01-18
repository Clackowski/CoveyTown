// eslint-disable-next-line import/no-extraneous-dependencies
import sql from 'mssql';

export default class Database {
  config = {};

  poolconnection = null;

  connected = false;

  allHats = 'baseball, chef, winter, tophat, cowboy, pirate, wizard, party, viking, special';

  constructor(config) {
    this.config = config;
  }

  async connect() {
    if (this.connected === false) {
      this.poolconnection = await sql.connect(this.config);
      this.connected = true;
    }
  }

  async disconnect() {
    this.poolconnection.close();
  }

  async executeQuery(query) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(query);

    return result.rowsAffected[0];
  }

  async readAll() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM Player`);

    return result.recordsets[0];
  }

  // returns collectDate of particular user from database.
  async readCollectDate(username) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request.query(
      `SELECT dailyCoinsCollectedOn FROM Player WHERE username = '${username}'`,
    );

    return result.recordset[0];
  }

  // returns collectDate of particular user from database.
  async setCollectDate(username) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request.query(
      `UPDATE Player SET dailyCoinsCollectedOn = CURRENT_TIMESTAMP WHERE username = '${username}';`,
    );

    return result.recordset[0];
  }

  // returns coin count of particular user from database.
  async readCoinCount(username) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request.query(
      `SELECT coveyCoinsAmount FROM Player WHERE username = '${username}'`,
    );

    return result.recordset[0];
  }

  // adds covey coins to given player's coin count
  async addCoveyCoin(username, amount) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request.query(
      `UPDATE Player SET coveyCoinsAmount = (coveyCoinsAmount + ${amount}) WHERE username = '${username}';`,
    );

    return result.rowsAffected[0];
  }

  // returns active hat of particular user from database.
  async readActiveHat(username) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request.query(
      `SELECT currentHat FROM Player WHERE username = '${username}'`,
    );

    return result.recordset[0];
  }

  // sets the active hat to the given hat
  async setActiveHat(username, hat) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request.query(
      `UPDATE Player SET currentHat = '${hat}' WHERE username = '${username}';`,
    );

    return result.rowsAffected[0];
  }

  // returns inventory of particular user from database.
  async readInventory(username) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request.query(
      `SELECT ${this.allHats} FROM Player WHERE username = '${username}'`,
    );

    return result.recordset[0];
  }

  // returns inventory of particular user from database.
  async readHatQuantity(username, hat) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request.query(`SELECT ${hat} FROM Player WHERE username = '${username}'`);

    return result.recordset[0];
  }

  // adds player to database
  async addPlayer(username) {
    await this.connect();
    const request = this.poolconnection.request();

    const result = await request.query(`INSERT INTO Player (username) VALUES ('${username}')`);

    return result.rowsAffected[0];
  }

  async addHat(username, hat) {
    await this.connect();
    const request = this.poolconnection.request();

    const result = await request.query(
      `UPDATE Player SET ${hat} = (${hat} + 1) WHERE username = '${username}';`,
    );

    return result.rowsAffected[0];
  }

  async removeHat(username, hat) {
    await this.connect();
    const request = this.poolconnection.request();

    const result = await request.query(
      `UPDATE Player SET ${hat} = (${hat} - 1) WHERE username = '${username}';`,
    );

    return result.rowsAffected[0];
  }
}
