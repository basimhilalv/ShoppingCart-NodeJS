const mongoose = require('mongoose');
//const mongoClient = require('mongodb').MongoClient;

const state={
    db:null
}
module.exports.connect=function(){
    const url = 'mongodb://0.0.0.0:27017/basiplay';
    //const dbname = 'basiplay'

    // mongoClient.connect(url,(err,data)=>{
    //     if(err) return done(err)
    //     state.db=data.db(dbname)
    //     done()
    // })
    mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true})
        .then(()=>{
        console.log('DB Connected Successfully')})
        .catch((err)=>{console.error(err)})
    
}

// module.exports.get=function(){
//     const collectionSchema = new mongoose.Schema({
//         name: String,
//         category: String,
//         created: String
        
//       });

//     const User = mongoose.model('User', collectionSchema);
//     const users = User.find()
//     return users;
// }



   
