const userModel = require('../model/UserModel')
const argon2 = require('argon2')
var jwt = require('jsonwebtoken')
require('dotenv').config();
const Stripe = require('stripe');


const ProductUnsubscription = async(req, res) => {
    const body = req.body;

    let select = "SELECT subscription , customer, paiement_manager FROM user WHERE id = ?;"
    let upudate = "UPDATE user  SET subscription = 1 WHERE id = ?;"

    let connect = userModel.connection();


    try{
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_KEY);

        const [userResult] = await new Promise((resolve, reject) => {
            connect.execute(select, [decoded.id], function (selectedError, selectedResult) {
              if (selectedError) {
                reject(selectedError);
              } else {
                resolve(selectedResult);
              }
            });
          });

          if (userResult.subscription !== 1) {
            return res.status(409).json({
              message: 'User not subscribed.',
            });
          }

          // Mettre à jour l'abonnement dans Stripe
        await Stripe.subscriptions.del(userResult.paiement_manager);

        // Mettre à jour l'utilisateur dans la base de données
        await new Promise((resolve, reject) => {
            connect.execute(upudate, [decoded.id], function (updatedErrorr, updatedResult) {
            if (updatedErrorr) {
                reject(updatedErrorr);
            } else {
                resolve();
            }
            });
        });

        return res.status(200).json({
            message: 'Unsubscribed successfully.',
          });

        // await new Promise((resolve, reject) => {
        //     connect.execute(upudate, [decoded.id], function (updatedErrorr, updatedResult) {
        //       if (updatedErrorr) {
        //         reject(updatedErrorr);
        //       } else {
        //         connect.execute(select, [decoded.id], function (selectedError, selectedResult) {
        //           if (selectedError) {
        //             reject(selectedError);
        //           } else {
        //             if (selectedResult[0].subscription === 1) {
        //               resolve(selectedResult);
        //             } else {
        //               reject(true);
        //             }
        //           }
        //         });
        //       }
        //     });
        //   });
        //   return res.status(200).json({
        //     message: 'Desabonnement effectué .',
        //   });
    }catch (error) {
        return res.status(409).json({
            message: 'Invalid token.',
        });
      }
    };

  

module.exports={ProductUnsubscription};