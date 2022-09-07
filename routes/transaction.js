const express = require('express');
const TransactionController = require('../controllers/transaction.js');

const router = express.Router();

const transaction = new TransactionController;


router.get('/', transaction.getTransaction)

router.post('/add', transaction.addTransaction)


module.exports = router;