import express from 'express';
import Database from './Database';

const router = express.Router();
router.use(express.json());
const config = {
  server: 'coveycoins.database.windows.net',
  database: 'CoveyCoinsData',
  user: 'CoveyBanker',
  password: 'uzq2nHaW',
  port: 1433,
};
const database = new Database(config);

router.get('/', async (_, res) => {
  try {
    // Return a list of players
    const players = await database.readAll();
    res.status(200).json(players);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.post('/:username', async (req, res) => {
  try {
    const rowsAffected = await database.addPlayer(req.params.username);
    res.status(200).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/:username/collectdate', async (req, res) => {
  try {
    // Return a collect date
    const collectDate = await database.readCollectDate(req.params.username);
    res.status(200).json(collectDate);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:username/collectdate', async (req, res) => {
  try {
    const rowsAffected = await database.setCollectDate(req.params.username);
    res.status(200).json(rowsAffected);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/:username/coveycoins', async (req, res) => {
  try {
    const coveyCoins = await database.readCoinCount(req.params.username);
    res.status(200).json(coveyCoins);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:username/coveycoins/:amount', async (req, res) => {
  try {
    // Return rows affected
    const rowsAffected = await database.addCoveyCoin(req.params.username, req.params.amount);
    res.status(200).json(rowsAffected);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/:username/activehat', async (req, res) => {
  try {
    const activeHat = await database.readActiveHat(req.params.username);
    res.status(200).json(activeHat);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:username/activehat/:hat', async (req, res) => {
  try {
    // Return rows affected
    const rowsAffected = await database.setActiveHat(req.params.username, req.params.hat);
    res.status(200).json(rowsAffected);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/:username/inventory', async (req, res) => {
  try {
    const inventory = await database.readInventory(req.params.username);
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/:username/hat/:hatid', async (req, res) => {
  try {
    // Return the quantity of hats the given user has
    const activeHat = await database.readHatQuantity(req.params.username, req.params.hatid);
    res.status(200).json(activeHat);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:username/hat/:hatid', async (req, res) => {
  try {
    const playerUsername = req.params.username;
    const hatId = req.params.hatid;
    if (playerUsername && hatId) {
      const rowsAffected = await database.addHat(playerUsername, hatId);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.delete('/:username/hat/:hatid', async (req, res) => {
  try {
    const playerUsername = req.params.username;
    const hatId = req.params.hatid;
    if (playerUsername && hatId) {
      const rowsAffected = await database.removeHat(playerUsername, hatId);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;
