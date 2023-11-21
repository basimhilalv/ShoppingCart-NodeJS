var db = require('../config/connection');
var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const signSchema = {
    fullname: String,
    email: String,
    password: String
}

const adminSchema = {
    fullname: String,
    email: String,
    password: String,
    employeeID: Number,
}
// const cartSchema ={
//     user:String,
//     collections:[String],
// }
// const Cart = mongoose.model("Cart",cartSchema)
const Admins = mongoose.model("Admins", adminSchema)
const Account = mongoose.model("Account", signSchema)

let adminData = new Admins({
    fullname: 'basim',
    email: 'basimv',
    password: '123',
    employeeID: 12345,
})
adminData.save()


module.exports = {
    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {
            userData.signpass = await bcrypt.hash(userData.signpass, 10)
            let signData = new Account({
                fullname: userData.fullname,
                email: userData.email,
                password: userData.signpass
            })
            signData.save().then((data) => {
                resolve(data)
            })
        })

    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let userdet = await Account.findOne({ email: userData.email })
            let response = {}
            if (userdet) {
                bcrypt.compare(userData.logpass, userdet.password).then((status) => {
                    if (status) {
                        console.log('Login Success')
                        response.userdet = userdet
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('Login Failed')
                        resolve({ status: false })
                    }
                })

            } else {
                console.log('FAILED')
                resolve({ status: false })
            }

        })
    },

    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let admindet = await Admins.findOne({ email: adminData.email })
            let response = {}
            if (admindet) {
                bcrypt.compare(adminData.logpass, admindet.password).then((status) => {
                    if (status) {
                        console.log('Login Success')
                        response.admindet = admindet
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('Login Failed')
                        resolve({ status: false })
                    }
                })

            } else {
                console.log('FAILED')
                resolve({ status: false })
            }
        })
    }
    //,
    // addToCart:(collId,userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let cartDet = await Cart.findOne({user:userId})

    //         if(cartDet){
    //             console.log(collId)
    //             Cart.findOneAndUpdate({'user':userId},{
    //                 $push:{collections:[collId]}
    //               }).then((response)=>{
    //                 resolve()
    //               })
    //         }else{
    //             let cartData= new Cart({
    //                 user:userId,
    //                 collections:[collId]
    //             })
    //             cartData.save().then((data)=>{
    //                 resolve(data);
    //             })
    //         }
    //     })
    // },
    // getFromCart:(userId)=>{
    //     return new Promise((resolve,reject)=>{
    //         resolve(Cart.aggregate([
    //             { $match: { user:userId} },
    //             { $lookup: {
    //                 from:'User',
    //                 localField:'collections',
    //                 foreignField:'_id',
    //                 as: 'cart_col'
    //             }}
    //         ]))
    //     })
    // }
}

// test> db.orders.aggregate([
//     { $match: { price: { $lt: 15 } } },
//     { $lookup: {
//           from: "inventory",
//           localField: "item",
//           foreignField: "sku",
//           as: "inventory_docs"
//     } },
//     { $sort: { price: 1 } },
//  ])