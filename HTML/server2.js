/*
Authors: Sherali Ozodov, Khamdam Kadirov, Igor Gabriel Bezerra Bernardon, John Ko
Date: 12/06/2023 
Class: CSC 337
File: server.js
Description: 
  Recipe Book Backend Server

  This file contains the server-side code for the Recipe Book application.
  It handles the following requests:
  - POST /login: Authenticates a user and creates a session.
  - POST /create-account: Creates a new user account.
  - GET /get/users: Fetches all users from the database.
  - GET /get/recipes: Fetches all recipes from the database.
  - GET /get/recipe/:user: Fetches all recipes from a specific user.
  - GET /search/recipe/:keyword: Searches for recipes by a keyword in their title.
  - POST /add/recipe: Adds a new recipe.
  - POST /logout: Logs out a user by deleting their session.
  - PUT /update-profile: Updates a user's profile.
  - GET /get-user-profile: Fetches a user's profile information.
  - POST /recipe/comment/:recipeId: Adds a comment to a recipe.
  - GET /recipe/comments/:recipeId: Fetches all comments for a recipe.
  - POST /recipe/like/:recipeId: Likes a recipe.
  - GET /recipe/likes/:recipeId: Fetches the number of likes for a recipe.
  - GET /recipes/most-liked: Fetches recipes sorted by likes.
  - GET /recipes/liked-by/:username: Fetches recipes liked by a specific user.
  - GET /recipes/category/:category: Fetches recipes by category.
*/

// Import dependencies
const mongoose = require("mongoose");
const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const multer = require('multer');
const app = express();
const port = 80;
const saltRounds = 10;


const db = mongoose.connection;
const mongoDBURL = "mongodb://127.0.0.1/recipes";
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
const Schema = mongoose.Schema;
db.on("error", () => {
  console.log("MongoDB connection error:");
});

// Define the RecipeSchema
const RecipeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: Buffer,
    required: false,
  },
  time: {
    type: String,
    required: false,
  },
  calories: {
    type: Number,
    required: false,
  },
  difficulty: {
    type: String,
    required: false,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  posted_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String, 
    required: false,
  }
},{
  timestamps: true
});

const Recipe = mongoose.model("Recipe", RecipeSchema);

// Define the UserSchema
var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  bio: String,
  profileImage: Buffer,
  recipes: [ {type: Schema.Types.ObjectId, ref: "Recipe" } ],
});

var User = mongoose.model("User", UserSchema);

// Define the Comment Schema
var CommentSchema = new Schema({
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

var Comment = mongoose.model('Comment', CommentSchema);

// Middleware for parsing cookies and request body
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });


// Object to hold active sessions with session ID as key
let sessions = {};

// Creates a new user session.
function addSession(usernameString) {
  let sid = Math.floor(Math.random() * 1000000000);
  // Record current time to track session creation time
  let now = Date.now();
  // Create session object and add it to the sessions object
  sessions[sid] = {
    username: usernameString,
    id: sid,
    time: now
  };
  return sid;
}

// Removes expired sessions. Session expiration is set to 10 minutes.
function removeSessions() {
  let now = Date.now();

  // Iterate over all the sessions
  for (let sid in sessions) {
    if (sessions.hasOwnProperty(sid)) {
      let session = sessions[sid];
      // Check if the session has expired
      if (session.time + 600000 < now) {
        // If the session has expired, delete it from the sessions object
        delete sessions[sid];
      }
    }
  }
}

setInterval(removeSessions, 20000);

// This function authenticates the user by checking the session cookie.
function authenticate(req, res, next) {
  // Retrieve the session ID from the cookie
  let sessionCookie = req.cookies['session_id'];

  if (sessionCookie) {
    // Look up the session by the session ID
    let sessionKey = Object.keys(sessions).find(key => sessions[key].id == sessionCookie);
    let session = sessions[sessionKey];

    // Check if session exists and hasn't expired
    if (session && (Date.now() - session.time) < 600000) {
      // Create a session on the request object if it's not already there
      if (!req.session) req.session = {};
      req.session.username = session.username;
      next();
    } else {
      // If session doesn't exist or is expired, delete it and redirect to index
      if (session) {
        delete sessions[sessionKey];
        res.redirect('/index.html');
      } else {
        // If session is not found, redirect to index
        res.redirect('/index.html');
      }
    }
  } else {
    // If no session cookie, redirect to index
    res.redirect('/index.html');
  }
}

// Middleware for serving static files, but with authentication 
//for certain paths
app.use((req, res, next) => {
  // Check if request is for 'home.html'
  if (req.path === '/home.html') {
    // Authenticate before serving these files
    authenticate(req, res, next);
  } else {
    next();
  }
}, express.static('public'));


// POST route for handling the login process
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username: username })
    .then(user => {
      if (!user) {
        return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
      }

      // Compare hashed password
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          let sid = addSession(username);
          res.cookie('session_id', sid, { maxAge: 1200000, httpOnly: true });
          res.json({ success: true, redirectTo: '/home.html' });
        } else {
          res.status(401).json({ success: false, message: 'Incorrect username or password.' });
        }
      });
    })
    .catch(err => {
      res.status(500).json({ success: false, message: 'An error occurred during login.' });
    });
});


// POST route for handling the creation of a new account
app.post('/create-account', (req, res) => {
  const { username, password, firstName, lastName } = req.body;

  // Check if the password meets the minimum length requirement
  if (password.length < 7) {
    return res.status(400).json({ success: false, message: 'Password must be at least 7 characters long.' });
  }

  User.findOne({ username: username })
    .then(existingUser => {
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Username is already taken.' });
      }

      // Hash the password before saving the user
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error hashing password.' });
        }

        const newUser = new User({ 
          username, 
          password: hash, 
          firstName, 
          lastName 
      });
        // Save the new user      
        newUser.save()
          .then(() => {
            res.status(201).json({ success: true, message: 'Account created successfully.' });
          })
          .catch(err => {
            res.status(500).json({ success: false, message: 'Error creating new user.' });
          });
      });
    })
    // Catch any errors that might occur
    .catch(err => {
      res.status(500).json({ success: false, message: 'Error checking for existing user.' });
    });
});


// GET route to fetch all users from the database.
app.get("/get/users", (req, res) => {
  User.find({})
    .then(users => {
      // Respond with the list of users in JSON format.
      res.json(users);
    })
    .catch(err => {
      // Handle any errors in fetching users.
      res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    });
});

// GET route to fetch all recipes from the database.
app.get("/get/recipes", (req, res) => {
  Recipe.find({})
    .sort({ createdAt: -1 }) // Sort by createdAt in descending order
    .populate('posted_by', 'username profileImage')
    .then(recipes => {
      // Respond with the list of recipes, including author details.
      res.json(recipes);
    })
    .catch(err => {
      // Handle any errors in fetching recipes.
      res.status(500).json({ success: false, message: 'Failed to fetch recipes.' });
    });
});

// GET route to fetch all recipes from a specific user.
app.get("/get/recipe/:user", (req, res) => {
  User.findOne({ username: req.params.user })
    .populate({
      path: "recipes",
      populate: { path: "posted_by", select: "username profileImage" }
    })
    .then(user => {
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.json(user.recipes);
    })
    .catch(err => {
      res.status(500).json({ success: false, message: 'Failed to fetch user recipes.' });
    });
});


// GET route to search for recipes by a keyword in their title.
app.get("/search/recipe/:keyword", (req, res) => {
  Recipe.find({ title: { $regex: req.params.keyword, $options: "i" } })
    .populate('posted_by', 'username profileImage')
    .then(recipes => {
      // Respond with the matching recipes.
      res.json(recipes);
    })
    .catch(err => {
      // Handle any errors in the search process.
      res.status(500).json({ success: false, message: 'Failed to search recipes.' });
    });
});

// POST route to add a recipe.
app.post('/add/recipe', authenticate, upload.single('image'), (req, res) => {
  const { title, category, content, time, calories, difficulty } = req.body;
  const imageBuffer = req.file.buffer;
  const username = req.session.username;

  User.findOne({ username: username })
    .then(user => {
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      // Create a new recipe
      const newRecipe = new Recipe({
        title,
        category,
        content,
        image: imageBuffer,
        time,
        calories,
        difficulty,
        posted_by: user._id,
        username: username
      });

      // Save the recipe and update the user's recipes array
      newRecipe.save()
        .then(savedRecipe => {
          user.recipes.push(savedRecipe._id);
          return user.save();
        })
        .then(() => {
          res.status(201).json({ success: true, message: 'Recipe added successfully.', recipeId: newRecipe._id });
        })
        .catch(err => {
          res.status(500).json({ success: false, message: 'Failed to save recipe or update user.', error: err });
        });
    })
    .catch(err => {
      res.status(500).json({ success: false, message: 'Error finding user.', error: err });
    });
});


// Logout endpoint in server.js
app.post('/logout', (req, res) => {
  let sessionCookie = req.cookies['session_id'];

  if (sessionCookie && sessions[sessionCookie]) {
      // Delete the session from the server
      delete sessions[sessionCookie];
      // Clear the session cookie
      res.clearCookie('session_id');
      res.json({ success: true, message: 'Logged out successfully.' });
  } else {
      res.status(400).json({ success: false, message: 'Not logged in.' });
  }
});


app.put('/update-profile', authenticate, upload.single('profileImage'), (req, res) => {
  const { username } = req.session;
  let updateData = { ...req.body };

  // Only update the image if a new image was uploaded
  if (req.file) {
      const imageBuffer = req.file.buffer;
      updateData.profileImage = imageBuffer;
  }
  // Update the user's profile
  User.findOneAndUpdate({ username }, updateData, { new: true })
      .then(updatedUser => {
          if (!updatedUser) {
              return res.status(404).json({ success: false, message: 'User not found.' });
          }
          res.json({ success: true, message: 'Profile updated successfully.', updatedUser });
      })
      .catch(err => {
          res.status(500).json({ success: false, message: 'Error updating profile.' });
      });
});


// Endpoint to get user profile information
app.get('/get-user-profile', authenticate, (req, res) => {
  // Assuming 'req.session.username' contains the username of the logged-in user
  User.findOne({ username: req.session.username }, 'firstName lastName bio profileImage')
    .then(user => {
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Send only the required fields
        res.json({
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          profileImage: user.profileImage,
        });
    })
    .catch(err => {
        res.status(500).json({ message: 'Error fetching user profile.' });
    });
});


// API endpoint to add a comment
app.post('/recipe/comment/:recipeId', (req, res) => {
  const { username, text } = req.body;
  const recipeId = req.params.recipeId;

  const newComment = new Comment({
    recipe: recipeId, // Storing ObjectId of the recipe
    username: username,
    text: text
  });

  newComment.save()
    .then(comment => {
      // After saving the comment, find the recipe and push the comment's ID into its comments array
      return Recipe.findById(recipeId)
        .then(recipe => {
          if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
          recipe.comments.push(comment._id);
          return recipe.save();
        });
    })
    .then(() => res.json({ message: 'Comment added successfully.' }))
    .catch(err => res.status(500).json({ message: 'Error adding comment.', error: err }));
});



app.get('/recipe/comments/:recipeId', (req, res) => {
  const recipeId = req.params.recipeId;

  // Find the recipe by ID and populate its comments
  Recipe.findById(recipeId)
      .populate('comments') // Assuming 'comments' is an array of ObjectIds in RecipeSchema
      .then(recipe => {
          if (!recipe) {
              return res.status(404).json({ message: 'Recipe not found.' });
          }
          
          Comment.find({ '_id': { $in: recipe.comments }})
              .populate('username')
              .then(comments => {
                  res.json(comments);
              })
              .catch(err => {
                  res.status(500).json({ message: 'Error fetching comments.', error: err });
              });
      })
      .catch(err => {
          res.status(500).json({ message: 'Error finding recipe.', error: err });
      });
});

// POST route for liking a recipe
app.post('/recipe/like/:recipeId', async (req, res) => {
  try {
    const username = req.body.username;

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    if (recipe.likedBy.includes(user._id)) {
      return res.status(400).json({ message: 'You have already liked this recipe.' });
    }

    recipe.likes += 1;
    recipe.likedBy.push(user._id);
    await recipe.save();

    res.json({ message: 'Recipe liked successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error liking recipe.' });
  }
});


// GET request to get likes for a recipe
app.get('/recipe/likes/:recipeId', (req, res) => {
  Recipe.findById(req.params.recipeId)
    .then(recipe => {
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found.' });
      }
      // Send the total number of likes
      res.json({ likes: recipe.likes });
    })
    .catch(err => res.status(500).json({ message: 'Error fetching recipe likes.' }));
});


// GET route to fetch recipes sorted by likes
app.get('/recipes/most-liked', (req, res) => {
  Recipe.find({})
    .sort({ likes: -1 }) // Sort by likes in descending order
    .populate('posted_by', 'username profileImage')
    .then(recipes => res.json(recipes))
    .catch(err => res.status(500).json({ message: 'Error fetching recipes.' }));
});

// GET route to fetch recipes liked by a specific user based on username
app.get('/recipes/liked-by/:username', (req, res) => {
  // Find the user by username
  User.findOne({ username: req.params.username })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Fetch recipes liked by the user's ID
      return Recipe.find({ likedBy: user._id })
        .populate('posted_by', 'username profileImage')
        .then(recipes => res.json(recipes))
        .catch(err => res.status(500).json({ message: 'Error fetching recipes.' }));
    })
    .catch(err => res.status(500).json({ message: 'Error finding user.' }));
});


// GET route to fetch recipes by category
app.get('/recipes/category/:category', (req, res) => {
  Recipe.find({ category: req.params.category })
    .populate('posted_by', 'username profileImage')
    .then(recipes => res.json(recipes))
    .catch(err => res.status(500).json({ message: 'Error fetching recipes.' }));
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

// Used only for seeding DB
module.exports = { User, Recipe };