const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require ('../models/product')
const checkAuth = require('../middleware/check-auth')

const OrdersController = require('../controller/orderController')

router.get('/', checkAuth, OrdersController.orders_get_all);

router.post('/', checkAuth, OrdersController.orders_add);

router.get('/:id', checkAuth, OrdersController.get_order);

router.put('/:id',(req,res,next)=>{
  const id = req.params.id;
  res.status(200).json({message : id})
})

router.delete('/:id', checkAuth, OrdersController.delete_order);

module.exports = router
