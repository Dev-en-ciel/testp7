const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    console.log("fileauth", req.file)
    console.log("bodyAuth", req.body)
    try {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
            if (err) {
                console.log("error", err, "token", token, "token décodé", decodedToken);
                res.status(401).json({ error: "Token invalid" });
            } else {
                const userId = decodedToken.id_user;
                const role = decodedToken.role;
                console.log("UserId : ", userId, "role : ", role);
                req.auth = { userId, role };
                if (req.body.userId && req.body.userId !== userId) {
                    throw new Error("Invalid user ID");
                } else {
                    next();
                }
            }
        });
    } catch (error) {
        console.log("bug", error)
        res.status(403).json({ error: "unauthorized request !" });
    }
};