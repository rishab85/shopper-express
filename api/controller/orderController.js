const Order = require('../models/order');


/* Get all orders */
exports.orders_get_all = (req,res,next)=> {
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
}

/* Add order */
exports.orders_add =  (req,res,next)=>{
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
}

/* Get order */
exports.get_order = (req,res,next)=> {
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
}


/* Delete order */
exports.delete_order = (req,res,next)=>{
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
}
