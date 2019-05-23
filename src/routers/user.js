const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth');
const multer = require("multer");

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateToken();

        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({user, token});
    } catch (error) {
        res.status(404).send(error);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( token => token.token!==req.token );
        await req.user.save();

        res.send({"status": "logout success"});
    } catch (error) {
        res.status(500).send({"status": "logout failed"});
    }
});

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send({"status": "logout all success"});
    } catch (error) {
        res.status(500).send({"status": "logout all failed"});
    }
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);

    // // /users -> all users
    // try {
    //     const users = await User.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send()
    // }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
});


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})
router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send()
        }

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// me delete
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
});

// upload avatar
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Upload an image file!'));
        }

        cb(undefined, true);
    }
});
router.post('/users/me/avatar', auth, upload.single("avatar"), async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send({message: "Success upload avatar"});
}, (err, req, res, next) => {
    res.status(400).send({error: err.message});
});
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({message: "Success remove avatar"});
}, (err, req, res, next) => {
    res.status(400).send({error: err.message});
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error("Image not found");
        }

        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send({"error": "Image not found!"});
    }
});

module.exports = router