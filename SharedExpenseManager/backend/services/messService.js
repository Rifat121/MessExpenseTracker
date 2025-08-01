const Mess = require("../models/Mess");
const User = require("../models/User");

exports.validateAdminSwap = async (messId, newAdminId, currentAdminId) => {
  const mess = await Mess.findById(messId);
  if (!mess) {
    throw new Error("Mess not found");
  }

  if (!mess.members.includes(newAdminId)) {
    throw new Error("User is not a member of this mess.");
  }

  const currentAdmin = await User.findById(currentAdminId);
  if (!currentAdmin) {
    throw new Error("Current admin not found.");
  }

  if (!currentAdmin.isAdmin) {
    throw new Error("Only the current admin can swap admin.");
  }

  return mess;
};