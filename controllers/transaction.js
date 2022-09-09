import AppError from '../middleware/appError.js';
import {HTTP_FORBIDDEN} from '../helpers/typeHttpError.js';

export default class TransactionController {

    async addTransaction(req, res) {
        try {
            if (!Boolean(req.query.id)) {
                throw new AppError('params id not found', 404)
            }
            res.status(200).json({id: req.query.id, status: true})
        } catch (err) {
            res.status(err.code).json({err: err.message})
        }
    }

    async getTransaction(req, res){
        try {
            if (!Boolean(req.query.id)) {
                throw new AppError('params id not found', HTTP_FORBIDDEN);
            }
            return res.status(200).json({id: req.query.id, status: true})
        }catch (err) {
            res.status(err.code).json({message:err.message})
        }
    }
}
