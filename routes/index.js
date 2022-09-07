const express = require('express');
const transactionRoute = require('./transaction.js');
const router = express.Router();

router.use('/transaction' , transactionRoute);

module.exports = router;
