const Mess = require("../models/Mess");
const User = require("../models/User");

// GET /mess/:id/members
exports.getMessMembers = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id).populate(
      "members",
      "name email messId isAdmin"
    );
    if (!mess) return res.status(404).json({ message: "Mess not found" });
    res.json(mess.members);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /mess/:id/swap-admin
exports.swapAdmin = async (req, res) => {
  const { newAdminId } = req.body;
  const messId = req.params.id;

  try {
    // Find the mess
    const mess = await Mess.findById(messId);
    if (!mess) {
      return res.status(404).json({ message: "Mess not found" });
    }

    // Check if the new admin is a member of the mess
    if (!mess.members.includes(newAdminId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this mess." });
    }

    // Check if the current admin is performing the swap
    const currentAdmin = await User.findById(mess.admin);
    if (!currentAdmin) {
      return res.status(404).json({ message: "Current admin not found." });
    }

    // Only current admin can swap the admin role
    if (!currentAdmin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only the current admin can swap admin." });
    }

    // Swap the admin in the mess document
    mess.admin = newAdminId; // Update the admin field in the mess schema
    await mess.save();

    // Update the `isAdmin` flag for users in the mess
    await User.updateMany({ mess: messId }, { $set: { isAdmin: false } }); // Reset all members' `isAdmin`
    await User.findByIdAndUpdate(newAdminId, { isAdmin: true }); // Set the new admin

    res.json({ message: "Admin swapped successfully." });
  } catch (err) {
    console.error("Swap Admin Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
