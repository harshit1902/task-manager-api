const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

//middlewears
const auth = require("../middleware/auth");
const User = require("../models/User");
const UserRoutes = new express.Router();

//user login
UserRoutes.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//user logout
UserRoutes.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.status(200).send("Logged out successfully");
  } catch (e) {
    res.status(500).send(e);
  }
});
// user logout all sessions
UserRoutes.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Logged out of all sessions successfully");
  } catch (e) {
    res.status(500).send(e);
  }
});
// Creating user
UserRoutes.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
// Reading all users
UserRoutes.get("/allU", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (e) {
    res.status(500).send("User Not found");
  }
});

// Reading own profile
UserRoutes.get("/users/me", auth, (req, res) => {
  res.send(req.user);
});

//Reading user by id
// UserRoutes.get("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send(`User Not found`);
//     }
//     res.status(200).send(user);
//   } catch (e) {
//     res.status(500).send("User Not found");
//   }
// });

//Updating User
UserRoutes.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    return res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Deleting User
UserRoutes.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send("User Not Found!");
    // }
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    return res.status(200).send(req.user);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//uploading profile picture
const avatar = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/))
      return cb(new Error("Please upload an Image (.jpeg,.jpg,.png)"));
    cb(undefined, true);
  },
});
UserRoutes.post(
  "/users/me/avatar",
  auth,
  avatar.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);

//deleting avatar
UserRoutes.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//fetching an avatar
UserRoutes.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = UserRoutes;
