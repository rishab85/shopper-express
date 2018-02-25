const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const mongoose = require('mongoose');
const Product = require ('../models/product')
router.get('/',(req,res,next)=>{
  Order.find()
  .populate('product')
  .exec()
  .then(result=>{
    res.status(200).json({
      count : result.length,
      orders : result.map(doc=>{
        return{
          _id : doc._id,
          product : doc.product,
          quantity : doc.quantity,
          request:{
            type : 'GET',
            url : 'http://localhost:3000/orders'+doc._id
          }
        }
      })
    });
  })
  .catch(err => {
    res.status(500).json({error : err});
  })
});

router.post('/', (req,res,next)=>{
  Product.findById(req.body.productId)
  .then(product =>{
    if(!product){
      return res.status(404).json({message : 'Product not found'})
    }
    const order = new Order({
      _id:mongoose.Types.ObjectId(),
      quantity : req.body.quantity,
      product : req.body.productId
    });
    return order.save()
  })
  .then(result => {
    res.status(200).json({
      message : "Order Received",
      createdOrder : {
        _id : result._id,
        product : result.product,
        quantity : result.quantity
      },
      request : {
        type : 'GET',
        url : 'http://localhost:3000/orders/'+result._id
      }
    });
  })
  .catch(err => {
    res.status(500).json({
      message : 'Product not found',
      error : err
    })
  })
});

router.get('/:id', (req,res,next)=>{
  const id = req.params.id
  Order.findById(id)
  .populate('product')
  .exec()
  .then(result=>{
    res.status(200).json({
      order : result,
      request : {
        type : 'GET',
        url : 'http://localhost:3000/orders'
      }
    })
  })
  .catch(err => {
    res.status(500).json({error: err});
  })
});

router.put('/:id',(req,res,next)=>{
  const id = req.params.id;
  res.status(200).json({message : id})
})

router.delete('/:id',(req,res,next)=>{
  const id = req.params.id;
  Order.remove({_id:id})
  .exec()
  .then(result => {
    res.status(200).json({
      message : 'Order Deleted'
    })
  })
  .catch(err => {
    res.status(500).json({error : err})
  })
})

module.exports = router
