import express from 'express';
import TransactionController from '../controllers/transaction.js';

const router = express.Router();
const transaction = new TransactionController;

router.get('/', transaction.getTransaction)
router.post('/add', transaction.addTransaction)

export default router;