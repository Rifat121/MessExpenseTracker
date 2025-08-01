const Mess = require("../models/Mess");
const User = require("../models/User");

const asyncHandler = require("express-async-handler");

// GET /mess/:id/members
exports.getMessMembers = asyncHandler(async (req, res) => {
  const mess = await Mess.findById(req.params.id).populate(
    "members",
    "name email messId isAdmin"
  );
  if (!mess) {
    res.status(404);
    throw new Error("Mess not found");
  }
  res.json(mess.members);
});

// PATCH /mess/:id/swap-admin
exports.swapAdmin = asyncHandler(async (req, res) => {
  const { newAdminId } = req.body;
  const messId = req.params.id;

  const mess = await Mess.findById(messId);
  if (!mess) {
    res.status(404);
    throw new Error("Mess not found");
  }

  if (!mess.members.includes(newAdminId)) {
    res.status(400);
    throw new Error("User is not a member of this mess.");
  }

  const currentAdmin = await User.findById(mess.admin);
  if (!currentAdmin) {
    res.status(404);
    throw new Error("Current admin not found.");
  }

  if (!currentAdmin.isAdmin) {
    res.status(403);
    throw new Error("Only the current admin can swap admin.");
  }

  mess.admin = newAdminId;
  await mess.save();

  await User.updateMany({ mess: messId }, { $set: { isAdmin: false } });
  await User.findByIdAndUpdate(newAdminId, { isAdmin: true });

  res.json({ message: "Admin swapped successfully." });
});
