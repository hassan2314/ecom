const express = require("express");
const bodyParser=require('body-parser');
const morgan = require('morgan');
const mongoose= require('mongoose');
const cors= require('cors')
const productsRouter= require('./routers/products')
const ordersRouter= require('./routers/orders')
const usersRouter= require('./routers/users')
const categoriesRouter= require('./routers/categories')
const authJwt = require('./helpers/jwt');


const app = express();

require('dotenv/config');
const api=process.env.API_URL;

//app.use('cors')
// app.options('*',cors())
app.use(bodyParser.json())
app.use(authJwt())
app.use('/public/uploads', express.static(__dirname+'/public/uploads'))
app.use((err, req, res, next)=>{
    if(err){
        res.status(500).json({message:err})
    }
})
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      // Handle unauthorized error
      res.status(401).json({ message: 'Unauthorized' });
    } else {
      // Handle other errors
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
app.use(morgan('tiny'));
app.use(`${api}/products`, productsRouter)
app.use(`${api}/orders`, ordersRouter)
app.use(`${api}/users`, usersRouter)
app.use(`${api}/categories`, categoriesRouter)



//password: BBOfhode5zM6vyjY
mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log('Database Connected')
})
.catch((err)=>{
    console.warn(err);
})

 app.listen(4500,()=>{
    console.log(api);
    console.log("Server is Running")
 })