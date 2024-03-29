const express = require("express");
const request = require("request");
require("dotenv").config();
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");

const Post = require("../../models/post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

const multer = require("multer");
const path = require("path");

const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: "./public/",
  filename: function(req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  }
});

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  "/",
  [
    auth,
    //[
    //  check("title", "Title is required")
    //    .not()
    //    .isEmpty(),
    //  check("title", "Title must be between 4 to 150 characters").isLength({
    //   min: 4,
    //    max: 150
    //  }),
    //  check("body", "Text is required")
    //    .not()
    //    .isEmpty()
    //]
  ],
  upload.any(),
  async (req, res) => {
   // console.log('req', req)
   // console.log("body", req.body);
   // console.log('files', req.files)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const username = user.fname + " " + user.lname;
      let imgCollection = []
      if(req.files){
        req.files.forEach(file => {
          imgCollection.push(file.filename)
        });
      }

      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        location: req.body.location,
        type: req.body.type,
        postStatus: req.body.postStatus,
        tags: req.body.tags,
        imgCollection,
        name: username,
        avatar: user.avatar,
        user: req.user.id
      });
      newPost.postStatus = "active";
      const post = await newPost.save();

      res.json(post);

      //console.log("POST_ID", post._id );
      const postTag = post.tags.toString();
      //console.log(postTag.toString());
      const notifyUser = await Profile.find( { occupation: postTag });
     // console.log("NOTIFIED USER",notifyUser);
     if(notifyUser != null) {
      notifyUser.map((user) => {
        console.log('POSTTTTAAA', post)
        user.notification.push({
          postReference: post._id
        });
        console.log("NOTIFICATIONS----------",user.notification);
        user.save();
      }); 
     /*if(notifyUser != null) {
        notifyUser.map((user) => {
          user.notification.push(post._id);
          console.log("NOTIFICATIONS----------",user.notification);
          user.save();
        }); 
       */

      /* for(var i = 0; i < notifyUser; i++) {
         notifyUser[i].notification.id = post._id;
         notifyUser[i].notification.type = "post";
         console.log("NOTIFICATIONS----------",notifyUser[i].notification);
         //notifyUser[i].save();
       } */
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Public - we might change it to private
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/user/:user_id
// @desc     Get all posts for a user
// @access   Private
router.get("/user/:user_id", auth, async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.user_id
    }).sort({ date: -1 });

    if (!posts) return res.status(400).json({ msg: "There are no posts" });

    res.json(posts);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check for ObjectId format and post
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

//Search Option

router.get("/search/:title", async (req, res) => {
  try {
    const posts = await Post.find({
      tags: { $regex: req.params.title, $options: "i" }
    }).sort({ date: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// router.get('/find/:query', cors(), function(req, res) {
//   var query = req.params.query;

//   Model.find({
//       'request': query
//   }, function(err, result) {
//       if (err) throw err;
//       if (result) {
//           res.json(result)
//       } else {
//           res.send(JSON.stringify({
//               error : 'Error'
//           }))
//       }
//   })
// })

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check for ObjectId format and post
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});


// @route    PUT api/posts/interest/:id
// @desc     interest a post
// @access   Private
router.put("/interest/:postId/:userId", 
auth, 
async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    
    // Check if the post has already been liked
    /*if (
      post.interest.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Already Interested" });
    }

    post.interest.unshift({ user: req.user.id });

    await post.save();

    res.json(post.interest);
    */
   const post = await Post.findById(req.params.postId);
   const user = await User.findById(req.params.userId);
   if( post ) {
     if( user ){
        post.interest.push(user);
        post.save();
        console.log("Successfulllllll post interest");
        res.status(200).json({ success: 'Done' })
     }
     else {
      return res.status(401).json({ errors: "User not found" });
    }
   }
   else {
    return res.status(401).json({ errors: "Post not found" });
  }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/interests/:id
// @desc     get interests  of a post
// @access   Private
router.get("/interests/:postId",
  [
    auth
  ], async ( req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let post_id = req.params.postId;
      //console.log("POST_ID", post_id);

      let post = await Post.findById(post_id);
      
      if(post) {
        
        const profiles = await Profile.find({'user' : { $in: post.interest}}).populate("user", [
          "fname",
          "lname",
          "email",
          "userphoto"
        ]);
        res.json(profiles);
        console.log("successfull", profiles);
      }

    } catch (err) {
      res.status(500).send("Server Error");
    }
  }
);

router.put("/assign/:id", 
auth, 
async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
/*
    var search = req.params.id;
    var para = search.split(",");
    console.log("SEARCH", search);
    console.log("PARA", para);
    let arr = para.map(ele => new mongoose.Types.ObjectId(ele));


    const post = await Post.findById(arr[0]);
    
    //console.log(post)
    console.log( arr[1]);
    // Check if the post has already been liked
    // if (
    //   post.assigned.filter(like => like.user.toString() === req.user.id).length > 0
    // ) {
    //   return res.status(400).json({ msg: "Already Interested" });
    // }

    post.assigned = arr[1];
    post.postStatus = "In Progress";

    await post.save();
    console.log("Post Assigned", post.assigned);
    res.json(post.assigned);

*/
    let user = req.params.id;
    let post = await Post.findOne({ interest: { $all: user }});
    if(post){
    post.assigned = user;
    post.postStatus = "Assigned";
    post.save();
    console.log("Assign succesfull", post.assigned); 
    } else
    console.log("Post not found");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


router.put("/status/:id", auth, async (req, res) => {
  try {

    var search = req.params.id;
    var para = search.split(",");
    para[0] = new mongoose.Types.ObjectId(para[0]);
    


    const post = await Post.findById(para[0]);
    
  
   
   
    post.postStatus = para[1];

    await post.save();

    res.json(post.postStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Get remove index
    const removeIndex = post.comments
      .map(comment => comment.id)
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
