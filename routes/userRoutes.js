const express = require('express')
const router = express.Router();

const checkUserData = require('../middlewares/checkUserData');
const userController = require('../controllers/userController');

const unsubscribeMiddleware = require('../middlewares/productUnsusbscriptionMiddleware')
const unsusbscriptionController = require('../controllers/productUnsusbscriptionController') 

router.post('/middleware', checkUserData, userController.createUser)

//Ajout de la route de desabonnement
router.put('/unsubscribe/:id', unsusbscriptionController.ProductUnsubscription)

module.exports = router;