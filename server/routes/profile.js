const { Router } = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fsPromises = require("fs/promises");
const path = require("path");
const User = require("../models/User");
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const { handleNotifications } = require("../utils/notificationHandler");

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
         { Password: 0, updatedAt: 0, Notifications: 0 }
      );

      if (!queryResult) throw { name: "UserNotFound" };

      let { _doc } = queryResult;
      let user;

      if (UniqueUsername === requestedUser) {
         user = _doc;
      } else {
         let { Issues, Solutions, ...restrictedAccessData } = _doc;
         user = restrictedAccessData;
      }

      if (user) return res.json({ status: "ok", user });
      else throw { name: "UnknownData" };
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
   let { UniqueUsername, Email } = req.thisUser;
   try {
      let file = req.file;

      if (!file) throw { name: "UploadFailure" };

      let buffer = file.buffer;

      await User.updateOne({ UniqueUsername, Email }, { ProfileImage: buffer });

      return res.json({ status: "ok", data: "Image Uploaded" });
   } catch (error) {
      return next(error);
   }
});

router.get("/notifications", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;

   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw { name: "UnauthorizedRequest" };
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
   let { UniqueUsername, Email } = req.thisUser;
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

      let search = await User.find({ $text: { $search: query } });
      let searchData = ["Not found"];

      if (search.length > 0) {
         searchData = search.map(resultUser => {
            let commonOrg = MembersOfSameOrg.some(
               member =>
                  resultUser.UniqueUsername === member.UniqueUsername &&
                  resultUser.UniqueUsername !== UniqueUsername
            );

            return commonOrg ? resultUser.UniqueUsername : "";
         });
      }
      return res.json({ status: "ok", data: searchData });
   } catch (error) {
      return next(error);
   }
});

module.exports = router;
