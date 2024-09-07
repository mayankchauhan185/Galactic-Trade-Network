const express = require('express');
require('dotenv').config();
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');

router.post('/register',
    [
        body("name", "Enter valid Name").isLength({ min: 5 }),
        body("email", "Enter valid Email").isEmail(),
        body("password", "Enter valid Password").isLength({ min: 5 })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, password, email } = req.body;

            let user = await User.findOne({ email });

            if (user !== null) {
                return res.status(400).json({ error: 'try with other values' })
            }
            const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({
                name: name,
                password: hashedPassword,
                email: email
            });

            return res.status(200).json({ message: "Successfully Created Account" });
        }
        catch (error) {
            console.error(error.message);
            return res.status(500).json({ message: "Something Went Wrong" });
        }

    });

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const passwordMatch = bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        const refreshToken = jwt.sign({
            id: user._id,
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        user.refreshToken = refreshToken;
        user = await User.findByIdAndUpdate(user._id, { $set: user }, { new: true });

        // Assigning refresh token in http-only cookie  
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'None', secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ message: "Logged in successfully", token, refreshToken });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Something Went Wrong" });
    }
});

router.post("/refresh", async (req, res) => {
    try {
        if (req.cookies?.jwt) {

            const refreshToken = req.cookies.jwt;

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(406).json({ message: 'Unauthorized' });
                }
                else {
                    // Correct token we send a new access token 
                    const accessToken = jwt.sign({
                        id: decoded._id
                    }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '1h'
                    });
                    return res.json({ accessToken });
                }
            })
        } else {
            return res.status(406).json({ message: 'Unauthorized' });
        }
    }
    catch (error) {
        console.log(e.message);
        return res.status(500).json({ message: "Something Went Wrong" });
    }
});

router.post("/logout", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.cookies?.jwt) {

            const refreshToken = req.cookies.jwt;

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(406).json({ message: 'Unauthorized' });
                }
                else {
                    let user = User.findById(decoded.id);
                    user.refreshToken = null;
                    user = await User.findByIdAndUpdate(user._id, { $set: user }, { new: true });

                    //clear the refresh token from cookie
                    res.clearCookie('jwt');

                    return res.status(200).json({ message: "Successfully Logged Out" });
                }
            });

        } else {
            return res.status(406).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Something Went Wrong" });
    }
})


module.exports = router;