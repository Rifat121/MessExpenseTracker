const Mess = require("../models/Mess");
const User = require("../models/User");

exports.createMess = async (messName, userId) => {
  const user = await User.findById(userId);
  if (user.messId) {
    throw new Error("User is already part of a mess.");
  }

  const existingMess = await Mess.findOne({ name: messName.toLowerCase() });
  if (existingMess) {
    throw new Error("Mess name already taken. Try a different name.");
  }

  const newMess = await Mess.create({
    name: messName.toLowerCase(),
    admin: user._id,
    members: [user._id],
  });

  user.messId = newMess._id;
  user.isAdmin = true;
  user.isApproved = true;
  await user.save();

  return newMess;
};

exports.joinMess = async (messName, userId) => {
  const user = await User.findById(userId);
  if (user.messId) {
    if (!user.isApproved) {
      throw new Error("You have already requested to join a mess.");
    } else {
      throw new Error("You are already part of a mess.");
    }
  }

  const mess = await Mess.findOne({ name: messName.toLowerCase() });
  if (!mess) {
    throw new Error("Mess not found. Check the name and try again.");
  }

  user.messId = mess._id;
  user.isApproved = false; // Wait for admin approval
  await user.save();

  return mess;
};

exports.approveUser = async (messId, userIdToApprove, adminId) => {
  const admin = await User.findById(adminId);
  if (!admin.messId?.equals(messId)) {
    throw new Error("Access denied to this mess");
  }

  const userToApprove = await User.findById(userIdToApprove);
  if (!userToApprove || !userToApprove.messId?.equals(messId)) {
    throw new Error("User not found in your mess");
  }

  if (userToApprove.isApproved) {
    throw new Error("User is already approved");
  }

  userToApprove.isApproved = true;
  await userToApprove.save();

  await Mess.findByIdAndUpdate(messId, {
    $addToSet: { members: userToApprove._id },
  });
};

exports.getPendingMembers = async (messId, adminId) => {
  const admin = await User.findById(adminId);
  if (!admin.messId?.equals(messId)) {
    throw new Error("Access denied to this mess");
  }

  return User.find({
    messId,
    isApproved: false,
  }).select("-password");
};

exports.rejectUser = async (messId, userIdToReject, adminId) => {
  const admin = await User.findById(adminId);
  if (!admin.messId?.equals(messId)) {
    throw new Error("Access denied to this mess");
  }

  const user = await User.findById(userIdToReject);
  if (!user || !user.messId?.equals(messId)) {
    throw new Error("User not found in your mess");
  }

  if (user.isApproved) {
    throw new Error("Use remove for approved members");
  }

  user.messId = null;
  user.isApproved = false;
  await user.save();
};

exports.removeUser = async (messId, userIdToRemove, adminId) => {
  const admin = await User.findById(adminId);
  if (!admin.messId?.equals(messId)) {
    throw new Error("Access denied to this mess");
  }

  const user = await User.findById(userIdToRemove);
  if (!user || !user.messId?.equals(messId)) {
    throw new Error("User not found in your mess");
  }

  if (!user.isApproved) {
    throw new Error("Use reject for unapproved users");
  }

  user.messId = null;
  user.isApproved = false;
  await user.save();

  await Mess.findByIdAndUpdate(messId, {
    $pull: { members: user._id },
  });
};

exports.getMessDetails = async (messId) => {
  const mess = await Mess.findById(messId);

  if (!mess) {
    throw new Error("Mess not found");
  }

  const admin = await User.findOne({ _id: { $in: mess.members }, isAdmin: true });
  if (!admin) {
    throw new Error("Admin not found among members");
  }

  const members = await User.find({ _id: { $in: mess.members } });

  return {
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
  };
};