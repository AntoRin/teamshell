const { Router } = require("express");
const multer = require("multer");
const stream = require("stream");
const User = require("../models/User");
const ProfileImage = require("../models/ProfileImage");
const { handleNotifications } = require("../utils/notificationHandler");

const AppError = require("../utils/AppError");

const router = Router();

const upload = multer({
   storage: multer.memoryStorage(),
   fileFilter: (req, file, cb) => {
      if (!file || file.mimetype.split("/")[0] !== "image")
         cb(new Error("Error parsing file"), false);
      else cb(null, true);
   },
   limits: {
      fileSize: 500000,
   },
});
const imageParser = upload.single("profileImage");

router.get("/details/:UniqueUsername", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let requestedUser = req.params.UniqueUsername;

   try {
      let queryResult = await User.findOne(
         {
            UniqueUsername: requestedUser,
         },
         { Password: 0, updatedAt: 0, Notifications: 0, __v: 0 }
      );

      if (!queryResult) throw new AppError("UserNotFoundError");

      let { _doc } = queryResult;
      let user;

      if (UniqueUsername === requestedUser) {
         user = _doc;
      } else {
         let { Issues, Solutions, ...limitedAccessData } = _doc;
         user = limitedAccessData;
      }

      let profileImage = await ProfileImage.findOne({
         UserContext: requestedUser,
      });

      if (profileImage) user.ProfileImage = profileImage.ImageData;

      if (user) return res.json({ status: "ok", user });
      else throw new AppError("BadRequestError");
   } catch (error) {
      return next(error);
   }
});

router.get("/profile-image/:UniqueUsername", async (req, res, next) => {
   let requestedUser = req.params.UniqueUsername;

   try {
      let profileImage = await ProfileImage.findOne({
         UserContext: requestedUser,
      });

      let imageUrl = "/assets/UserIcon.png";

      if (profileImage) {
         let savedImage = profileImage.ImageData;

         if (savedImage.length > 100) {
            res.set("Content-Type", "image/png");
            return res.write(savedImage, "base64", err => {
               if (err) throw err;
            });
         } else if (savedImage.startsWith("https://")) imageUrl = savedImage;
      }

      return res.redirect(303, imageUrl);
   } catch (error) {
      return next(error);
   }
});

router.put("/edit", async (req, res, next) => {
   let { Bio, Username } = req.body;
   let { UniqueUsername, Email } = req.thisUser;

   try {
      await User.updateOne({ UniqueUsername, Email }, { Bio, Username });
      res.json({ status: "ok", message: "Profile Updated" });
   } catch (error) {
      return next(error);
   }
});

router.post("/uploads/profile-image", imageParser, async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   try {
      let file = req.file;

      if (!file) throw new AppError("UploadFailureError");

      let buffer = file.buffer;

      let ImageData = buffer.toString("base64");

      await ProfileImage.updateOne(
         { UserContext: UniqueUsername },
         { ImageData },
         { upsert: true }
      );

      return res.json({ status: "ok", data: "Image Uploaded" });
   } catch (error) {
      return next(error);
   }
});

router.get("/notifications", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;

   try {
      let user = await User.findOne({ UniqueUsername, Email }).lean();
      if (!user) throw new AppError("UnauthorizedRequestError");
      let { Notifications } = user;
      return res.json({ status: "ok", data: { Notifications } });
   } catch (error) {
      return next(error);
   }
});

router.post("/notifications", handleNotifications);

router.get("/notifications/seen", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;

   try {
      await User.updateOne(
         { UniqueUsername, Email, "Notifications.Seen": false },
         { $set: { "Notifications.$[].Seen": true } },
         { multi: true }
      );
      return res.json({ status: "ok", data: "" });
   } catch (error) {
      console.log(error);
      next(error);
   }
});

router.get("/search", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let query = req.query.user;

   try {
      let aggregrationPipeline = [
         {
            $match: {
               UniqueUsername: `${UniqueUsername}`,
            },
         },
         {
            $lookup: {
               from: "Organizations",
               localField: "Organizations.OrganizationName",
               foreignField: "OrganizationName",
               as: "SameOrg",
            },
         },
         {
            $lookup: {
               from: "Users",
               localField: "SameOrg.Members",
               foreignField: "UniqueUsername",
               as: "MembersOfSameOrg",
            },
         },
         {
            $project: {
               "MembersOfSameOrg.UniqueUsername": 1,
            },
         },
      ];

      let sameOrgAggregation = await User.aggregate(aggregrationPipeline);
      let { MembersOfSameOrg } = sameOrgAggregation[0];

      let regexSearch = await User.find({
         UniqueUsername: { $regex: new RegExp(`\\b\\w*${query}\\w*\\b`, "i") },
      });

      let searchData = ["Not found"];

      if (regexSearch.length > 0) {
         searchData = regexSearch.map(resultUser => {
            let commonOrg = MembersOfSameOrg.some(
               member =>
                  resultUser.UniqueUsername === member.UniqueUsername &&
                  resultUser.UniqueUsername !== UniqueUsername
            );

            return commonOrg ? resultUser.UniqueUsername : null;
         });
      }
      return res.json({ status: "ok", data: searchData });
   } catch (error) {
      return next(error);
   }
});

module.exports = router;