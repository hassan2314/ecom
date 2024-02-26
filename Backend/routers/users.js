const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const jwt = require("jsonwebtoken");


router.get("/", async (req, res) => {
  const userList = await User.find();
  res.send(userList);
  console.warn('ffff');

});

router.get("/:id", async (req, res) => {
  try {
    const userList = await User.findById(req.params.id).select("-passwordHash");
    if (userList) res.send(userList);
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    apartment: req.body.apartment || "",
    street: req.body.street || "",
    city: req.body.city,
    country: req.body.country,
    zip: req.body.zip || "",
    isAdmin: req.body.isAdmin || false,
  });

  user = await user.save();

  if (!user) return res.status(404).send("Try Again");
  else res.send(user);
});

router.put("/:id", async (req, res) => {
  try {
    const userList = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        passwordHash: req.body.passwordHash,
        phone: req.body.phone,
        apartment: req.body.apartment || "",
        street: req.body.street || "",
        city: req.body.city,
        country: req.body.country,
        zip: req.body.zip || "",
        isAdmin: req.body.isAdmin || false,
      },
      { new: true },
    );
    if (userList) res.send(userList);
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await User.findOneAndDelete({ _id: req.params.id });

    if (result) {
      // console.log('User deleted successfully:', result);
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      // console.log('User not found.');
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    //console.error('Error deleting User:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const userListCount = await User.countDocuments();
    res.json({ Count: userListCount });
  } catch (error) {
    console.error("Error getting user count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get/users", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false });
    res.json({ users });
  } catch (error) {
    console.error("Error getting User :", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get/admins", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: true });
    res.json({ users });
  } catch (error) {
    console.error("Error getting User :", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(400).send("User Not Found");
  } else {
    if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin
        },
        process.env.secret,
        { expiresIn: "3d" },
      );
      res.status(200).send({
        user: user.email,
        token: token,
        isAdmin: user.isAdmin
      });
    } else res.status(400).send("Password Wrong");
  }
});

module.exports = router;
