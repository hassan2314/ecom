const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress1: {
    type: String,
    required: true,
  },
  shippingAddress2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});
orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});
exports.Order = mongoose.model("Order", orderSchema);


/*
{
  "orderItems": [" {quantity": 2,"product": "65b7e1e611355b1cf67d8a05"},
   {quantity": 5,"product": "65b7e248da5079a379eae50d"}], 
  "shippingAddress1": "123 Street",
  "shippingAddress2": "Apt 456",
  "city": "Cityville",
  "country": "Countryland",
  "zip": "12345",
  "phone": "123-456-7890",
  "status": "Pending",
  "totalPrice": 100, // Replace with the actual total price
  "user": "65bd157c36a4d2a259a4d213" // Replace with a valid User ObjectId
}
*/