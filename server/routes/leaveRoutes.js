const express = require("express");

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave
} = require("../controllers/leaveController");

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
  leaveValidator
} = require("../validators/leaveValidator");

const router = express.Router();

/* All leave routes require authentication */

router.use(protect);

/* Employee Routes */

router.post(
  "/",
  leaveValidator,
  validate,
  applyLeave
);

router.get(
  "/my",
  getMyLeaves
);

/* HR Routes */

router.get(
  "/all",
  authorize("hr"),
  getAllLeaves
);

router.patch(
  "/:id/approve",
  authorize("hr"),
  approveLeave
);

router.patch(
  "/:id/reject",
  authorize("hr"),
  rejectLeave
);

module.exports = router;