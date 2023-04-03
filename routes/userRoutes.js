const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");

router.post("/signup", UserController.create);
router.post("/login", UserController.authenticate);
router.get("/:id", UserController.show);

module.exports = router;
