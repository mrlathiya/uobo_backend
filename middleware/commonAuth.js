const jwt = require("jsonwebtoken");
const dealerSchema = require("../models/dealer");
const userSchema = require("../models/user");

module.exports = async function (req, res, next) {

    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Auth Error" });

    try {
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const dealer = await dealerSchema.findOne({ _id: decodeToken.user_id });

        if (dealer === undefined || dealer === null) {
            const user = await userSchema.findOne({ _id: decodeToken.user_id });

            if (!user) {
                return res.status(401).json({ message: "Auth Error" });
            }

            req.userToken = decodeToken.decodeToken;

            req.user = user;
            req.userType = 'customer';
            
        } else {
            req.userToken = decodeToken.decodeToken;

            req.user = dealer;
            req.userType = 'dealer';
        }
        next();

    } catch (e) {
        res.status(401).send({ message: "Invalid Token" });
    }
};