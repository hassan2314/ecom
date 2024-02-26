const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Assuming your product model is named 'Product'
    required: true,
  },
  // Add other fields as needed
});

OrderItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

OrderItemSchema.set('toJSON', {
  virtuals: true
});

const OrderItem = mongoose.model('OrderItem', OrderItemSchema);

module.exports = OrderItem;

