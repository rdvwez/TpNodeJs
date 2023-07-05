const userModel = require('../model/UserModel')
const argon2 = require('argon2')
var jwt = require('jsonwebtoken')
require('dotenv').config();
const Stripe = require('stripe');

const EditSubscription = async(req, res) => {
    const price = req.body.price;

    let select = "SELECT subscription, customer, price FROM user WHERE id = ?;";
    let updateUser = "UPDATE user SET price = ? WHERE id = ?;";

    let connect = userModel.connection();

    try{
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_KEY);

        ///ajouter le traitement de modification de l'abonnement 
        const [userResult] = await new Promise((resolve, reject) => {
            connect.execute(select, [decoded.id], function (err, selectResult) {
              if (err) {
                reject(err);
              } else {
                resolve(selectResult);
              }
            });
          });

        //   const { price } = body;

          if (!price) {
            return res.status(400).json({
              message: 'Subscription ID is required.',
            });
          }

          if (userResult.subscription && userResult.price) {
            // Annuler l'abonnement existant sur Stripe
            await stripe.subscriptions.update(userResult.subscription, {
              cancel_at_period_end: false,
            });
      
            await stripe.subscriptions.update(userResult.subscription, {
              cancel_at_period_end: true,
            });
          }

          const newSubscription = await stripe.subscriptions.create({
            customer: userResult.customer,
            items: [{ price: price }],
          });

          await new Promise((resolve, reject) => {
            connect.execute(updateUser, [newSubscription.id, userId], function (err, updateResult) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
      
          return res.status(200).json({
            message: 'Subscription updated successfully.',
          });


    }catch (error) {
        return res.status(409).json({
            message: 'Invalid token.',
        });
      }
}

module.exports=EditSubscription;