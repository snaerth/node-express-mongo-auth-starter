const {
    validateEmail
} = require('../services/utils');
const User = require('../models/user');
const jwt = require('jwt-simple');

// User signup route
exports.signup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const message = req.body.message;

    if (!email || !password || !message) {
        return res.status(422).send({
            error: 'You must provide email, password and message'
        });
    }

    // Validate email
    if (!validateEmail(email)) {
        return res.status(422).send({
            error: `${email} is not a valid email`
        });
    }

    // Check if password length is longer then 6 characters
    if (password.length < 6) {
        return res.status(422).send({
            error: 'The password must be of minimum length 6 characters'
        });
    }

    // See if user with given email exists
    User.findOne({
        email
    }, (error, existingUser) => {
        if (error) return next(error);

        // If a user does exist, return error
        if (existingUser) {
            return res.status(422).send({
                error: 'Email is in use'
            });
        }

        // If a user does not exist, create and save new user
        const user = new User({
            email: email,
            password: password,
            message: message
        });

        user.save((error) => {
            if (error) {
                return next(error);
            }

            // Respond to request that user was created
            res.json({
                token: tokenForUser(user)
            });
        });

    });
}

// User signin route
exports.signin = (req, res, next) => {
    res.send({
        token: tokenForUser(req.user)
    });
}

// Gets token for user
// @param {Object} user - User object
// @returns {String} token - Newly created token
function tokenForUser(user) {
    const timestamp = new Date().getTime();
    return jwt.encode({
        sub: user.id,
        iat: timestamp
    }, process.env.JWT_SECRET);
}