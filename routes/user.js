import express from "express";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "../middlewares/verifyToken.js";
import User from "./../models/User.js";

const router = express.Router();

//admin only can listing all users
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { new: newQ } = req.query;
    const { admin } = req.query;
    const { all } = req.query;

    let users;

    if (newQ) {
      //return new customers
      users = await User.find({ isAdmin: false }, { password: 0, __v: 0 })
        .sort({ createdAt: -1 })
        .limit(5);
    } else if (admin) {
      //return all admins only
      users = await User.find({ isAdmin: true }, { password: 0, __v: 0 });
    } else if (all) {
      //return all users (customers and admins)
      users = await User.find({}, { password: 0, __v: 0 });
    } else {
      //return all customers only
      users = await User.find({ isAdmin: false }, { password: 0, __v: 0 });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

// admin or user can get user
router.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    let user = await User.findOne(
      { _id: req.params.id },
      { password: 0, __v: 0 }
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// admin only can be delete user
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete({ _id: req.params.id });

    res.status(200).json("deleted!");
  } catch (error) {
    res.status(500).json(error);
  }
});

// Authorized user can be create user
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.create({ ...req.body });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
