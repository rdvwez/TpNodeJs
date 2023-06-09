const express = require('express')
const router = express.Router();


const unsubscribeMiddleware = require('../middlewares/productUnsusbscriptionMiddleware')
const unsusbscriptionController = require('../controllers/productUnsusbscriptionController') 


//Ajout de la route de desabonnement
router.put('/:id', unsubscribeMiddleware, unsusbscriptionController.ProductUnsubscription)

module.exports = router;