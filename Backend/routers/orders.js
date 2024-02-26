const express = require("express");
const router = express.Router();
const { Order } = require("../models/Order");
// const { OrderItem } = require("../models/OrderItem");
const OrderItem = require("../models/OrderItem");

router.get("/", async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .populate({ path: "orderItems", populate: "product" })
    .sort({ dateOrdered: -1 });
  res.send(orderList);
});

router.get("/get/myorder/:userid", async (req, res) => {
  const orderList = await Order.find({user: req.params.userid})
    .populate({ path: "orderItems", populate: "product" })
    .sort({ dateOrdered: -1 });
  res.send(orderList);
});

router.get("/get/totaluserorders/:userid", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ user: req.params.userid });

    res.json({
      totalOrders,
    });
  } catch (error) {
    console.error('Error retrieving total orders:', error);
    res.status(500).json({
      error: error.message,
      success: false,
    });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const orderList = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      });
    if (orderList) res.send(orderList);
    else res.status(404).json({ message: "Order not found" });
  } catch (error) {
    res.status(404).json({ message: "Order not found" });
  }
});

router.post("/", async (req, res) => {
  try {
    // Ensure req.body.orderItems is an array before using map
    const orderItemIds = Array.isArray(req.body.orderItems)
      ? await Promise.all(
          req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
              quantity: orderItem.quantity,
              product: orderItem.product,
            });
            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
          }),
        )
      : [];
    const orderItemIdsResolved = await orderItemIds;
    const totalPrices = await Promise.all(
      orderItemIdsResolved.map(async (orderItemId) => {
        const orderItem =
          await OrderItem.findById(orderItemId).populate("product");

        if (!orderItem || !orderItem.product) {
          // Handle the case where orderItem or orderItem.product is null
          return 0; // Or another default value
        }

        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      }),
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    console.log(totalPrice);
    const order = new Order({
      orderItems: orderItemIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      country: req.body.country,
      zip: req.body.zip,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      error: error.message,
      success: false,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const orderList = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true },
    );
    if (orderList) res.send(orderList);
    else res.status(404).json({ message: "Order not found" });
  } catch (error) {
    res.status(404).json({ message: "Order not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await Order.findOneAndDelete({ _id: req.params.id });

    if (result) {
      // console.log('Order deleted successfully:', result);
      res.status(200).json({ message: "Order deleted successfully" });
    } else {
      // console.log('Order not found.');
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    //console.error('Error deleting Order:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);

  if(!totalSales){
    res.status(404).json({ message: "No Sales" });
  }
  else{
    res.status(500).json({ TotalSales :totalSales.pop().totalSales });
  }
});


router.get("/get/count", async (req, res) => {
  try {
    const orderListCount = await Order.countDocuments();
    res.json({ TotalOrders: orderListCount });
  } catch (error) {
    console.error("Error getting Order count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
