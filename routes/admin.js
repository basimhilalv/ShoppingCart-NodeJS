var express = require('express');
var router = express.Router();
var helper = require('../helpers/useraccount-helper');
var collectionHelper = require('../helpers/collection-helper');

var verifyadminlogin = (req,res,next)=>{
  if(req.session.adminLogin){
    next()
  }else{
    res.redirect('admin/login')
  }
}


/* GET users listing. */
router.get('/', verifyadminlogin, function(req, res, next) {
  collectionHelper.getCollection().then((games)=>{
    res.render('admin/collection',{admin:true,games});
    //console.log(games)
  })
});

router.get('/login',(req,res)=>{
  res.render('admin/login')
})

router.post('/login', (req,res)=>{
  helper.adminLogin(req.data).then((response)=>{
    console.log(response)
  })
})

router.get('/add-collection',(req,res)=>{
  res.render('admin/add-collection')
})

router.post('/add-collection',(req,res)=>{
  
  //console.log(req.body)
  //console.log(req.files.image)
  collectionHelper.addCollection(req.body,req.files.image)
  res.redirect('/admin')
})

router.get('/delete-collection',(req,res)=>{
  let collId = req.query.id
  console.log(collId)
  collectionHelper.deleteCollection(collId).then((response)=>{
    res.redirect('/admin')
  })
})

router.get('/edit-collection', (req,res)=>{
  let collId = req.query.id
  collectionHelper.getCollection().then((games)=>{
    //console.log(games)
    let colDetail = games.find((object)=>{
      return object._id == collId
    })
    //console.log(colDetail)
    res.render("admin/edit-collection",{colDetail})
  })
  
  
})

router.post('/edit-collection', (req,res)=>{
  collectionHelper.updateCollection(req.query.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image = req.files.image;
      image.mv('./public/images/'+req.query.id+'.jpg');
    }
  })
})
module.exports = router;
