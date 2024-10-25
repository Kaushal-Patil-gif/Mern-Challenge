const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    res.json(response.data);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
