var db=require('../config/connection');
var mongoose=require('mongoose');
var objectId=require('mongodb').ObjectID;
var Razorpay=require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_aQMVAx844Oe1sO',
  key_secret: 'kPuoE6nUYBjfaHqJ9c886pDe',
});

const userSchema ={
    name: String,
    category: String,
    created: String,
    price: String
  }

const cartColSchema ={
  quantity: Number,
  _id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref:'User'
  }
}

const orderSchema ={
  userId: String,
  payment: String,
  status: String,
  orderTotal:Number,
  orderDate:String,
  deliveryDetails : {
    address: [String],
    email: String,
    contact: String
  },
  collections:{
    type:Object
  }
}

const cartSchema ={
    user:String,
    //collections:[{type: mongoose.Schema.Types.ObjectId}],
    //collections:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    collections:[cartColSchema]
}
const Order = mongoose.model("Order", orderSchema)

const Cart = mongoose.model("Cart",cartSchema)

const User = mongoose.model("User",userSchema)

module.exports={
    addCollection:(games,image)=>{
        // const userSchema ={
        //     name: String,
        //     category: String,
        //     created: String,
        //     price: String
        //   }
        //   const User = mongoose.model("User",userSchema)
          let gameData = new User({
            name: games.name,
            category: games.category,
            created: games.created,
            price: games.price
          })
          gameData.save()
          image.mv('./public/images/'+gameData._id+'.jpg',(err,done)=>{
            if(!err){
                console.log("Image Successfully added")
            }else{
                console.log(err);
            }
          });
    },
    getCollection:()=>{

        return new Promise(async(resolve,reject)=>{
        //     const userSchema ={
        //         name: String,
        //         category: String,
        //         created: String,
        //         price: String
        //       }
        //       const User = mongoose.model("User",userSchema)
            resolve(User.find().lean())
        })
        
    },
    deleteCollection:(collId)=>{
      return new Promise((resolve,reject)=>{
        User.deleteOne({_id:collId}).then((response)=>{
          console.log(response)
          resolve(response)
        })
      })
    },

    updateCollection:(collId,collDet)=>{
      return new Promise((resolve,reject)=>{
        User.findByIdAndUpdate(collId,{
          name: collDet.name,
          category: collDet.category,
          created: collDet.created,
          price: collDet.price
        }).then((response)=>{
          resolve()
        })
      })
    },
    addToCart:(collId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartDet = await Cart.findOne({user:userId})
           
          //console.log("searching collection found"+cartDet.collections)
            if(cartDet){
                let colIndex = cartDet.collections.findIndex(products=> products._id==collId)
                //console.log(collId)
                console.log(colIndex+"Index of value found")
                if(colIndex!=-1){
                  Cart.findOneAndUpdate({'user':userId, 'collections._id':collId},{
                    $inc:{'collections.$.quantity':1}
                  }).then(()=>{
                    console.log("Quantity updated")
                    resolve()
                  })
                }else{
                Cart.findOneAndUpdate({'user':userId},{
                    $push:{collections:[{
                      _id:collId,
                      quantity:1
                    }]}
                  }).then((response)=>{
                    resolve()
                  })}
            }else{
                let cartData= new Cart({
                    user:userId,
                    //collections:[collId]
                    collections:[{
                      _id:collId,
                      quantity:1
                    }]
                })
                cartData.save().then((data)=>{
                    resolve(data);
                })
            }
        })
    },
    getCartCount:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        let count = 0
        let cart = await Cart.findOne({user:userId})
        if(cart){
          count = cart.collections.length
        }
        console.log(count)
        resolve(count)
      })
    },
    getFromCart:(userId)=>{
        return new Promise( async (resolve,reject)=>{

        let cartCol = await Cart.findOne({user:userId}).populate('collections._id').lean()
        resolve(cartCol)
            
        })
    },
    getCartTotal:(userId)=>{
      return new Promise(async (resolve,reject)=>{
        let cartCol = await Cart.findOne({user:userId}).populate('collections._id').lean()
        if(cartCol.collections != null){
        var sumQty = 0
        cartCol.collections.map((data)=>{
          //console.log("Hiiiiiiii"+data._id.price)

          sumQty = sumQty + (data.quantity*data._id.price)
        })
        //console.log(sumQty)
        resolve(sumQty)
    }} )
    },
    deleteCart:(collId,userId)=>{
      return new Promise(async (resolve,reject)=>{
        // Cart.deleteOne({collections:[collId]}).then((response)=>{
        //   console.log(response)
        //   resolve(response)
        //})
        await Cart.updateOne({ user:userId}, { '$pull': { collections:{_id:collId}} }).then((response)=>{
          //console.log(response)
          console.log('Item removed')
          resolve(response)
        })
      })
    },

    changeQty:(colDet,count,userId)=>{
      console.log("change qty reached")
      count=parseInt(count)
      //let oldCount = Cart.findOne({'user':userId, 'collections._id':colDet})
      
      return new Promise((resolve,reject)=>{
        Cart.findOneAndUpdate({'user':userId, 'collections._id':colDet},{
          $inc:{'collections.$.quantity':count}
        }).then((response)=>{
          console.log("Quantity updated"+response)
          resolve(response)
        }).catch((error) => {
          console.error("Error updating quantity:", error);
          reject(error);
      });
      })
    },
    placeOrder:(order,collection,total)=>{
        return new Promise((resolve,reject)=>{
          console.log(order,collection,total)
          let status = order.pay === 'cod'?'completed':'pending'
          let orderData = new Order({
            userId: order.userId,
            payment: order.pay,
            status: status,
            orderTotal:total,
            orderDate: new Date(),
            deliveryDetails : {
              address: order.address,
              email: order.email,
              contact: order.phone
              },
            collections:collection
            })
            orderData.save().then(async (data)=>{
              await Cart.deleteOne({user:order.userId})
              resolve(data._id)
            })

        })
    },
    getOrders:(userId)=>{
      return new Promise (async(resolve,reject)=>{
       let orders = await Order.find({userId:userId}).lean()
       resolve(orders)
      })
    },
    
    generateRazorpay:(userId,totalPrice)=>{
      return new Promise((resolve,reject)=>{
        var options = {
          amount: totalPrice*100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: userId
        };
        instance.orders.create(options, function(err, order) {
          console.log("New Order Created :",order);
          resolve(order)
        });
      })
    },

    verifyPayment:(payDetails)=>{
      return new Promise ((resolve,reject)=>{
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256','kPuoE6nUYBjfaHqJ9c886pDe')
        hmac.update(payDetails['payment[razorpay_order_id]']+'|'+payDetails['payment[razorpay_payment_id]'])
        hmac=hmac.digest('hex')
        if(hmac==payDetails['payment[razorpay_signature]']){
          resolve()
        }else{
          reject()
        }
      })
    },

    changeOrderStatus:(orderId)=>{
      return new Promise(async(resolve,reject)=>{
        await Order.updateOne({_id:orderId},{ $set:{status:'Placed'}}).then(()=>{
          resolve()
        })
      })
    }

}