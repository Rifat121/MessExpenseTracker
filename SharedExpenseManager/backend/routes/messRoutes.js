const express = require("express");
const router = express.Router();
const {
  getMessMembers,
  swapAdmin,
  getMessSummary,
} = require("../controllers/messController");

const { protect, isAdmin } = require("../middleware/authMiddleware");
const messService = require("../services/messService");
const asyncHandler = require("express-async-handler");

router.get("/:id/members", protect, isAdmin, getMessMembers);
router.patch("/:id/swap-admin", protect, isAdmin, swapAdmin);
router.get("/summary/:messId", protect, getMessSummary);

router.post(
  "/create",
  protect,
  asyncHandler(async (req, res) => {
    const { messname } = req.body;
    const newMess = await messService.createMess(messname, req.user._id);
    res.status(201).json({
      message: "Mess created successfully.",
      messname: newMess.name,
      messId: newMess._id,
    });
  })
);

router.post(
  "/join",
  protect,
  asyncHandler(async (req, res) => {
    const { messname } = req.body;
    const mess = await messService.joinMess(messname, req.user._id);
    res.json({
      message: "Request sent to join mess. Waiting for admin approval.",
      messname: mess.name,
    });
  })
);

router.post(
  "/:messId/approve/:userId",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { messId, userId } = req.params;
    await messService.approveUser(messId, userId, req.user._id);
    res.json({ message: "User approved successfully" });
  })
);

router.get(
  "/:messId/pending-members",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { messId } = req.params;
    const pendingUsers = await messService.getPendingMembers(
      messId,
      req.user._id
    );
    res.json(pendingUsers);
  })
);

router.delete(
  "/:messId/reject/:userId",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { messId, userId } = req.params;
    await messService.rejectUser(messId, userId, req.user._id);
    res.json({ message: "User rejected and unlinked from mess" });
  })
);

router.delete(
  "/:messId/remove/:userId",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { messId, userId } = req.params;
    await messService.removeUser(messId, userId, req.user._id);
    res.json({ message: "Member removed successfully" });
  })
);

router.get(
  "/:messId",
  protect,
  asyncHandler(async (req, res) => {
    const { messId } = req.params;
    const mess = await messService.getMessDetails(messId);
    res.json(mess);
  })
);

module.exports = router;
