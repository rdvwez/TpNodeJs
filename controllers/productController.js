// { } obligatoire ici
const { faker } = require('@faker-js/faker');
require('dotenv').config();
var jwt = require('jsonwebtoken')
const userModel = require('../model/UserModel')
const Subscription = require('../utils/stripe')

// const createProduct = async(req, res) => {
//     const productId = Math.floor(Math.random() * 10000); // Génère un faux ID

//     const connect = userModel.connection();
//     let response;

//     const error = await jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_KEY, async function(err, decoded) {
//         try {
//             // on lui demande de promesse afin de savoir si il va bien renvoyer les données
//             const resultat = await new Promise((resolve, reject) => {
//                 let select = "SELECT * FROM user WHERE email = ?;"
//                 // si l'execution a bien eu lieu 
//                 let result = connect.execute(select,[decoded.email],  async function(err, results, fields) {
                
//                     // si lemail existe déjà on renvoi erreur dans le catch
//                     if (results.length > 0) {

//                         const response = await Subcription(req.body.number, req.body.exp_month, req.body.exp_year, req.body.cvc)
//                         // pm_1NH4aUHwdX9FnYsKKyAT75Md
//                         // cus_O3AwdUE62JLCwH

                        
//                         let select = "SELECT customer, paiement_manager FROM user WHERE id = ?;"
//                         let updated2 = "UPDATE user SET customer =?, paiement_manager =? WHERE id = ?"
//                         let result = connect.execute(select,[decode.id],  function(err, results, fields) {
                            
//                             if (results.length > 0) {
                                
//                                 return resolve(results)
//                             }
//                             // sinon il continue son bout de chemin
//                             return reject(true)
//                         })
//                         return resolve(results)

//                     }
//                     // sinon il continue son bout de chemin
//                     return reject(true)
//                 })
        
//             })
//             return true
//         } catch (error) {
//            return false
//         } 

//     });

//     if (!error) {
//         return res.status(409).json({
//             message: 'Utilisateur inconnue',
//         });
//     }

//     // body { card, cvc, month, year }

    

//     return res.status(200).json({
//         message: 'Produit créé avec succès',
//         product: {id: productId, ...req.body},
//         response
//     });
// };


const createProduct = async (req, res) => {
    const connect = userModel.connection();
    let response;
  
    try {
      const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_KEY);
  
      const [userPaiemanentInfo] = await new Promise((resolve, reject) => {
        let select = "SELECT customer, paiement_manager FROM user WHERE email = ?;";
        connect.execute(select, [decoded.email], function (err, results, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
  
      if (!userPaiemanentInfo) {
        return res.status(409).json({
          message: 'Unknow User ',
        });
      }
  
      if (userPaiemanentInfo.customer && userPaiemanentInfo.paiement_manager) {
        return res.status(409).json({
          message: 'Product already exists',
        });
      }
  
      // Effectuer le paiement uniquement si l'utilisateur existe dans la base de données
      response = await Subscription(
        req.body.number,
        req.body.exp_month,
        req.body.exp_year,
        req.body.cvc
      );

      const productId = Math.floor(Math.random() * 10000); // Génère un faux ID pour le produit
  
      // Mettre à jour les champs customer et paiement_manager dans la base de données
      let updateUser = "UPDATE user SET customer = ?, paiement_manager = ? WHERE email = ?;";
      await new Promise((resolve, reject) => {
        connect.execute(updateUser, [response.customer, response.id, decoded.email], function (err, updateResult) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
  
      return res.status(200).json({
        message: 'Product successfully dreated!',
        product: { id: productId, ...req.body },
        response,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'An error has occurred',
      });
    }
  };


const readProduct = (req, res) => {
    // Génération de fausses données product
    const productName = faker.commerce.productName();
    const productDescription = faker.commerce.productDescription();
    const productPrice = faker.commerce.price();


    const productId = req.params.id; 
    res.status(200).json({
        // On crée un faux produit pour simuler la réponse de la BDD
        id: productId,
        name: productName,
        description: productDescription,
        price: productPrice
    });
}

const updateProduct = (req, res) => {
    res.status(200).json({
        message: 'Produit mis à jour avec succès',
    });
};

const deleteProduct = (req, res) => {
    res.status(200).json({
        message: 'Produit supprimé avec succès',
    });
};

// Syntaxe différente pour exporter des modules

module.exports={createProduct, readProduct, updateProduct, deleteProduct};
