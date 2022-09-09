import express from 'express';
import  transactionRoute from './transaction.js';

const router = express.Router();

router.use('/transaction' , transactionRoute);

export default router


