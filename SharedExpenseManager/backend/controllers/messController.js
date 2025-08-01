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

const { validateAdminSwap } = require("../services/messService");

// PATCH /mess/:id/swap-admin
exports.swapAdmin = asyncHandler(async (req, res) => {
  const { newAdminId } = req.body;
  const messId = req.params.id;
  const currentAdminId = req.user._id;

  const mess = await validateAdminSwap(messId, newAdminId, currentAdminId);

  mess.admin = newAdminId;
  await mess.save();

  await User.updateMany({ mess: messId }, { $set: { isAdmin: false } });
  await User.findByIdAndUpdate(newAdminId, { isAdmin: true });

  res.json({ message: "Admin swapped successfully." });
});
