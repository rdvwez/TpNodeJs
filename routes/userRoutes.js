const express = require('express')
const router = express.Router();
const Validator = require('../utils/validator');

const checkUserData = require('../middlewares/checkUserData');
const userController = require('../controllers/userController');

const unsubscribeMiddleware = require('../middlewares/productUnsusbscriptionMiddleware')
const validateSubscriptionEdition = require('../middlewares/editSubscriptionMiddleWare')
const unsusbscriptionController = require('../controllers/productUnsusbscriptionController') 
const editSubscription = require('../controllers/editSubscriptionController') 

router.post('/middleware', checkUserData, userController.createUser)

//Ajout de la route de desabonnement
router.put('/unsubscribe/:id', unsusbscriptionController.ProductUnsubscription)
router.post('/editsubscription', validateSubscriptionEdition(Validator.editSubscription), editSubscription)

module.exports = router;