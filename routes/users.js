var express = require('express');
var router = express.Router();
var helper = require('../helpers/collection-helper')
var userHelper = require('../helpers/useraccount-helper')

var verifyLogin = (req, res, next) => {
  if (req.session.userlogIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.userdet
  let cartCount = null
  if (user) {
    cartCount = await helper.getCartCount(user._id)
  }
  console.log(cartCount)

  console.log(user)
  helper.getCollection().then((games) => {
    res.render('user/view-collection', { admin: false, games, user, cartCount });
    //console.log(games)
  })

  // res.render('index',{games,admin:false});
});

router.get('/login', (req, res) => {
  if (req.session.userdet) {
    res.redirect('/')
  } else {
    res.render('user/login', { "logInErr": req.session.userlogInErr })
    req.session.userlogInErr = false
  }

})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response)
    // let colDetail = response.find((object)=>{
    //   return object._id == req.query.id
    // })

    req.session.userdet = response;
    req.session.userlogIn = true;

    res.redirect('/')
  })
})

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {

      req.session.userdet = response.userdet
      req.session.userlogIn = true,
        res.redirect('/')
    } else {
      req.session.userlogInErr = "Invalid Username and Password"
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.userdet = null
  req.session.userlogIn = false
  res.redirect('/login')
})

router.get('/cart', verifyLogin, async (req, res) => {

  // console.log(totalPrice)
  helper.getFromCart(req.session.userdet._id).then(async (data) => {
    let totalPrice = 0
    if (data) {
      totalPrice = await helper.getCartTotal(req.session.userdet._id)
      let cartDat = data.collections
      console.log(cartDat)
      res.render('user/cart', { cartDat, user: req.session.userdet, totalPrice })
    } else {
      res.render('user/cart', { status: true, user: req.session.userdet })
    }

  })

})

router.get('/add-to-cart', (req, res) => {
  console.log(req.query.id, req.session.userdet._id)
  helper.addToCart(req.query.id, req.session.userdet._id).then(() => {
    res.json({ status: true })
  })
})

router.get('/remove', verifyLogin, (req, res) => {
  let collId = req.query.id
  console.log(collId)

  helper.deleteCart(collId, req.session.userdet._id).then(() => {
    res.redirect('/cart')
  })


})

router.get('/changeQty', (req, res) => {
  let initQty = parseInt(req.query.countOld)
  //const initQty = document.getElementById('itemcount')
  //console.log("Ajax change qty body"+req.body)
  helper.changeQty(req.query.id, req.query.count, req.session.userdet._id).then((response) => {
    // Handle the result here
    // For example, send a response to the client
    // let equalTo1 = false
    // if(initQty == 1){
    //    equalTo1=true
    // }else{
    //     equalTo1 = false
    // }
    console.log(response.collections)
    // console.log("12849012-9125-1285-sflkasnflas;fkj"+equalTo1)
    // const cartURL = '/cart?check=equalTo1'
    res.redirect('/cart')
  })
    .catch((error) => {
      // Handle any errors here
      console.error("An error occurred:", error);
      res.status(500).send("Internal Server Error");
    });

})

router.get('/place-order', verifyLogin, async (req, res) => {
  let totalPrice = await helper.getCartTotal(req.session.userdet._id)
  res.render('user/place-order', { totalPrice, user: req.session.userdet })
})

router.post('/place-order', verifyLogin, async (req, res) => {
  console.log(req.body)
  let collection = await helper.getFromCart(req.session.userdet._id)
  let totalPrice = await helper.getCartTotal(req.session.userdet._id)
  helper.placeOrder(req.body, collection.collections, totalPrice).then((response) => {
    if (req.body['pay'] === 'cod') {
      res.json({ codSuccess: true })
    } else {
      helper.generateRazorpay(response, totalPrice).then((response) => {
        res.json(response)
      })
    }
    //res.render('user/order-done')

  })
})

router.get('/order-done', verifyLogin, (req, res) => {
  res.render('user/order-done', { user: req.session.userdet })
})

router.get('/orders', verifyLogin, (req, res) => {
  helper.getOrders(req.session.userdet._id).then((response) => {
    let orders = response

    res.render('user/orders', { user: req.session.userdet, orders })
  })

})

router.post('/verify-payment', (req, res) => {
  console.log("verified payment", req.body)
  helper.verifyPayment(req.body).then(() => {
    helper.changeOrderStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false, errMsg: 'Error' })
  })
})

module.exports = router;



