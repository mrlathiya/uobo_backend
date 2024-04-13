const jwt = require("jsonwebtoken");
const dealerSchema = require("../models/dealer");

module.exports = async function (req, res, next) {

    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Auth Error" });

    try {
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const dealer = await dealerSchema.findOne({ _id: decodeToken.user_id });

        if (!dealer) {
            return res.status(401).json({ message: "Auth Error" });
        }

        req.userToken = decodeToken.decodeToken;
        req.user = dealer;
        next();
    } catch (e) {
        res.status(401).send({ message: "Invalid Token" });
    }
};