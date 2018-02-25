const express = require('express');
const router = express.Router();
const mongoose = require ('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
  destination : function(req,file,cb){
    cb(null,'uploads/');
  },
  filename : function(req,file,cb){
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
    cb(null, true);
  }else{
    cb(null,false);
  }
}
const upload = multer({storage:storage,
  limits:{fileSize : 1024 * 1024 *5},
  fileFilter : fileFilter
});

const Product = require ('../models/product');
router.get('/',(req,res,next)=>{

  Product.find()
  .select('name price _id productImage')
  .exec()
  .then(result => {
    const response ={
      count:result.length,
      products:result.map(doc=>{
        return{
          name : doc.name,
          price : doc.price,
          _id : doc.id,
          productImage : doc.productImage,
          request : {
            type : 'GET',
            url : 'http://localhost:3000/products/'+doc._id
          }
        }
      })
    }
    res.status(200).json(response);
  })
  .catch(err=>{
    res.status(500).json({error : err});
  })

});


router.post('/',checkAuth,upload.single('productImage'),(req,res,next)=>{
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name : req.body.name,
    price : req.body.price,
    productImage : req.file.path
  });

  product.save().then(result => {
    res.status(200).json({
      message : 'Success',
      createdProduct : {
        name : result.name,
        price : result.price,
        _id : result._id,
        productImage : result.productImage,
        request:{
          type : 'GET',
          url : 'http://localhost:3000/products'+result._id
        }
      }
    });
  }).catch(err => {
    res.status(500).json({error : err});
  });

});

router.get('/:id',checkAuth,(req,res,next)=>{
  const id = req.params.id;
  Product.findById(id)
  .exec()
  .then(doc => {
    if(doc){
      res.status(200).json(doc);
    }else{
      res.status(404).json({message : 'No valid Entry Found for Provided Id'});
    }
  })
  .catch(err => {
    res.status(500).json(err);
  });
});

router.put('/:id',checkAuth,upload.single('productImage'),(req,res,next)=>{
  const id = req.params.id;
  const updateOps = {};
  for(const ops of req.body){
    updateOps[ops.propName] = ops.value;
  }
  Product.update({_id:id},{$set : updateOps})
  .exec()
  .then(result=>{
    res.status(200).json(result);
  }).catch(err=>{
    res.status(500).json({error:err});
  })
});

router.delete('/:id',checkAuth,(req,res,next)=>{
  const id = req.params.id;
  Product.remove({_id:id}).exec()
  .then(result => {
    res.status(200).json({message:'Successfully Deleted'});
  })
  .catch(err => {
    res.status(500).json({message:err});
  });
});
module.exports = router;
