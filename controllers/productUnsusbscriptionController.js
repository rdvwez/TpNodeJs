const userModel = require('../model/UserModel')
const argon2 = require('argon2')
var jwt = require('jsonwebtoken')
require('dotenv').config();
const Stripe = require('stripe');


const ProductUnsubscription = async(req, res) => {
    const body = req.body;
    const userId = req.params.id;

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

          if (!userResult || userResult.subscription !== 1) {
            return res.status(409).json({
              message: 'User not subscribed.',
            });
          }

          // Annule l'abonnement dans Stripe
        const canceledSubscription = await Stripe.subscriptions.del(userResult.paiement_manager);

        // Vérifie si l'abonnement a été correctement annulé dans Stripe
        if (canceledSubscription.status === 'canceled') {
            // Modifie les informations de l'utilisateur dans la base de données
            await new Promise((resolve, reject) => {
              connect.execute(updateUser, [userId], function (err, updateResult) {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });

            return res.status(200).json({
                message: 'Unsubscribed successfully.',
              });
        } else {
                // Si l'abonnement n'a pas été annulé correctement dans Stripe
                return res.status(500).json({
                  message: 'Failed to cancel subscription in Stripe.',
                });
        }

          // Mettre à jour l'abonnement dans Stripe
        // await Stripe.subscriptions.del(userResult.paiement_manager);

        // // Mettre à jour l'utilisateur dans la base de données
        // await new Promise((resolve, reject) => {
        //     connect.execute(upudate, [decoded.id], function (updatedErrorr, updatedResult) {
        //     if (updatedErrorr) {
        //         reject(updatedErrorr);
        //     } else {
        //         resolve();
        //     }
        //     });
        // });

        // return res.status(200).json({
        //     message: 'Unsubscribed successfully.',
        //   });

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