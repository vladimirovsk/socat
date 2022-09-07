const errorHandler = require('../middleware/errorHandler.js');
const AppError = require('../middleware/appError.js');
const {HTTP_NOT_FOUND, HTTP_FORBIDDEN} =require('../helpers/typeHttpError.js');

class TransactionController {

    async addTransaction(req, res){
        try {
            if (!Boolean(req.id)){
                throw new AppError('params id not found', 404)
            }
            res.status(200).json({status:true})
        }catch (err) {
            res.status(err.code).json({err: err.message})
        }
    }

    async getTransaction(req, res){
        try {
            if (!Boolean(req.id)){
                throw new AppError('params id not found', HTTP_FORBIDDEN);
            }
            return res.status(200).json({status:true})
        }catch (err) {
            res.status(err.code).json({message:err.message})
        }
    }
}

module.exports = TransactionController