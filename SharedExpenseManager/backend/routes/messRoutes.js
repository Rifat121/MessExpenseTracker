const express = require("express");
const router = express.Router();
const {
  getMessMembers,
  swapAdmin,
  getMessSummary,
} = require("../controllers/messController");

const { protect, isAdmin } = require("../middleware/authMiddleware"); // your JWT middleware
const User = require("../models/User");
const Mess = require("../models/Mess");

router.get("/:id/members", protect, isAdmin, getMessMembers);
router.patch("/:id/swap-admin", protect, isAdmin, swapAdmin);
router.get("/summary/:messId", protect, getMessSummary);

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

// POST /api/mess/:messId/approve/:userId
router.post("/:messId/approve/:userId", protect, isAdmin, async (req, res) => {
  try {
    const { messId, userId } = req.params;

    if (!req.user.messId?.equals(messId)) {
      return res.status(403).json({ message: "Access denied to this mess" });
    }

    const userToApprove = await User.findById(userId);
    if (!userToApprove || !userToApprove.messId?.equals(messId)) {
      return res
        .status(404)
        .json({ message: "User not found in your mess" });
    }

    if (userToApprove.isApproved) {
      return res.status(400).json({ message: "User is already approved" });
    }

    userToApprove.isApproved = true;
    await userToApprove.save();

    await Mess.findByIdAndUpdate(messId, {
      $addToSet: { members: userToApprove._id },
    });

    res.json({ message: "User approved successfully" });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});


// GET /api/mess/:messId/pending-members
router.get("/:messId/pending-members", protect, isAdmin, async (req, res) => {
  try {
    const { messId } = req.params;

    // Ensure admin belongs to the same mess
    if (!req.user.messId?.equals(messId)) {
      return res.status(403).json({ message: "Access denied to this mess" });
    }

    const pendingUsers = await User.find({
      messId,
      isApproved: false,
    }).select("-password");
    console.log(pendingUsers)
    res.json(pendingUsers);
  } catch (error) {
    console.error("Pending Members Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// DELETE /api/mess/:messId/reject/:userId
router.delete("/:messId/reject/:userId", protect, isAdmin, async (req, res) => {
  try {
    const { messId, userId } = req.params;

    if (!req.user.messId?.equals(messId)) {
      return res.status(403).json({ message: "Access denied to this mess" });
    }

    const user = await User.findById(userId);
    if (!user || !user.messId?.equals(messId)) {
      return res.status(404).json({ message: "User not found in your mess" });
    }

    if (user.isApproved) {
      return res
        .status(400)
        .json({ message: "Use remove for approved members" });
    }

    user.messId = null;
    user.isApproved = false;
    await user.save();

    res.json({ message: "User rejected and unlinked from mess" });
  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// DELETE /api/mess/:messId/remove/:userId
router.delete("/:messId/remove/:userId", protect, isAdmin, async (req, res) => {
  try {
    const { messId, userId } = req.params;

    if (!req.user.messId?.equals(messId)) {
      return res.status(403).json({ message: "Access denied to this mess" });
    }

    const user = await User.findById(userId);
    if (!user || !user.messId?.equals(messId)) {
      return res.status(404).json({ message: "User not found in your mess" });
    }

    if (!user.isApproved) {
      return res
        .status(400)
        .json({ message: "Use reject for unapproved users" });
    }

    user.messId = null;
    user.isApproved = false;
    await user.save();

    await Mess.findByIdAndUpdate(messId, {
      $pull: { members: user._id },
    });

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// 🟢 Get Mess details by messId
router.get('/:messId', protect, async (req, res) => {
  const { messId } = req.params;

  try {
    // Fetch mess by messId
    const mess = await Mess.findById(messId);

    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Fetch admin details using adminId
    const admin = await User.findOne({ _id: { $in: mess.members }, isAdmin: true });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found among members' });
    }

    // Fetch members details using member IDs
    const members = await User.find({ '_id': { $in: mess.members } });

    res.json({
      _id: mess._id,
      name: mess.name,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      members: members.map((member) => ({
        _id: member._id,
        name: member.name,
        email: member.email,
      })),
    });
  } catch (error) {
    console.error('Error fetching mess details:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
