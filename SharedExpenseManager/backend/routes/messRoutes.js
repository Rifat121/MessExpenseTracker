const express = require("express");
const router = express.Router();
const { getMessMembers, swapAdmin } = require("../controllers/messController");
const { protect, isAdmin } = require("../middleware/authMiddleware"); // your JWT middleware
const User = require("../models/User");
const Mess = require("../models/Mess");

router.get("/:id/members", protect, isAdmin, getMessMembers);
router.patch("/:id/swap-admin", protect, isAdmin, swapAdmin);

router.post("/create", protect, async (req, res) => {
  const { messname } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user.messId) {
      return res
        .status(400)
        .json({ message: "User is already part of a mess." });
    }

    const existingMess = await Mess.findOne({ name: messname.toLowerCase() });
    if (existingMess) {
      return res
        .status(400)
        .json({ message: "Mess name already taken. Try a different name." });
    }

    const newMess = await Mess.create({
      name: messname.toLowerCase(),
      admin: user._id,
      members: [user._id],
    });

    user.messId = newMess._id;
    user.isAdmin = true;
    user.isApproved = true;
    await user.save();

    res.status(201).json({
      message: "Mess created successfully.",
      messname: newMess.name,
      messId: newMess._id,
    });
  } catch (error) {
    console.error("Create Mess Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

router.post("/join", protect, async (req, res) => {
  const { messname } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user.messId) {
      return res
        .status(400)
        .json({ message: "User is already part of a mess." });
    }

    const mess = await Mess.findOne({ name: messname.toLowerCase() });
    if (!mess) {
      return res
        .status(404)
        .json({ message: "Mess not found. Check the name and try again." });
    }

    user.messId = mess._id;
    user.isApproved = false; // Wait for admin approval
    await user.save();

    res.json({
      message: "Request sent to join mess. Waiting for admin approval.",
      messname: mess.name,
    });
  } catch (error) {
    console.error("Join Mess Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// POST /api/mess/approve/:userId
router.post("/approve/:userId", protect, async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);

    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can approve members" });
    }

    const userToApprove = await User.findById(req.params.userId);
    if (!userToApprove || !userToApprove.messId.equals(admin.messId)) {
      return res
        .status(404)
        .json({ message: "User not found or not part of your mess" });
    }

    userToApprove.isApproved = true;
    await userToApprove.save();

    await Mess.findByIdAndUpdate(admin.messId, {
      $addToSet: { members: userToApprove._id },
    });

    res.json({ message: "User approved successfully" });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// GET /api/mess/pending-members
router.get("/pending-members", protect, async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);

    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can view pending members" });
    }

    const pendingUsers = await User.find({
      messId: admin.messId,
      isApproved: false,
    }).select("-password"); // Exclude hashed password

    res.json(pendingUsers);
  } catch (error) {
    console.error("Pending Members Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// DELETE /api/mess/reject/:userId
router.delete("/reject/:userId", protect, async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin.isAdmin)
      return res
        .status(403)
        .json({ message: "Only admins can reject members" });

    const userToReject = await User.findById(req.params.userId);
    if (!userToReject || !userToReject.messId?.equals(admin.messId)) {
      return res
        .status(404)
        .json({ message: "User not found or not part of your mess" });
    }

    if (userToReject.isApproved) {
      return res.status(400).json({
        message: "Cannot reject already approved member. Use remove instead.",
      });
    }

    userToReject.messId = null;
    userToReject.isApproved = false;
    await userToReject.save();

    res.json({ message: "User rejected and removed from mess" });
  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// DELETE /api/mess/remove/:userId
router.delete("/remove/:userId", protect, async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin.isAdmin)
      return res
        .status(403)
        .json({ message: "Only admins can remove members" });

    const userToRemove = await User.findById(req.params.userId);
    if (!userToRemove || !userToRemove.messId?.equals(admin.messId)) {
      return res
        .status(404)
        .json({ message: "User not found or not part of your mess" });
    }

    if (!userToRemove.isApproved) {
      return res
        .status(400)
        .json({ message: "Use reject to remove a pending user" });
    }

    userToRemove.messId = null;
    userToRemove.isApproved = false;
    await userToRemove.save();

    await Mess.findByIdAndUpdate(admin.messId, {
      $pull: { members: userToRemove._id },
    });

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
