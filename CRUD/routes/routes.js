const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer'); // this is a package for the images;
const fs = require('fs');

// code for image upload
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads");
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("profile_picture")


// route for adding new user
router.post("/add", upload, (req, res) => {
    const user = new User({
        username: req.body.username,
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        gender: req.body.gender,
        profile_picture: req.body.profile_picture,
        password: req.body.password,

    });
    user.save((err) => {
        if (err) {
            res.json({message: err.message, type: 'danger'})
        } else {
            res.send("user added successfully")
        }
    })

})

// getting all the users from the database;
router.get("/", (req, res) => {
    User.find().exec((err, users) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.send(users)
            
        }
    });
});
router.get('/add', (req, res) => {
    res.render('add_user', { title: "Add users"})
})


//edit user router
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if (err) {
            res.redirect("/");
        } else {
            if (user == null) {
                res.redirect("/")
            } else {
                res.send(user)
            }
        }
    })
});

// update user
router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }
    User.findByIdAndUpdate(
        id,
        {
            username: req.body.username,
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            password: req.body.password,
            profile_picture: req.body.profile_picture,
        },
        (err, result) => {
            if (err) {
                res.json({ message: err.message, type: "danger" });
            } else {
                res.send("updated successfully")
            }
        })
    
});

// delete user route
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id, (err, result) => {
        if (result.profile_picture != '') {
            try {
                fs.unlinkSync('./uploads' + result.profile_picture);
            } catch (err) {
                console.log(err);
            }
        }
        if (err) {
            res.json({ message: err.message });
        } else {
            res.send("user deleted")
        }
    })
})

module.exports = router;