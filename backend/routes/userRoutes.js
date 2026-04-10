const express = require("express");

const {
  getCurrentUser,
  getUserById,
  listUsers,
  updateCurrentUser,
} = require("../controllers/userController");
const { isAdmin, protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { updateCurrentUserSchema } = require("../validations/userValidation");

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.patch("/me", protect, validate(updateCurrentUserSchema), updateCurrentUser);
router.get("/", protect, isAdmin, listUsers);
router.get("/:id", protect, isAdmin, getUserById);

module.exports = router;
