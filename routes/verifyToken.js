const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  //authHeader is sent as "AuthHeader JWTtoken" so spliting it to get the token only
  const token = authHeader.split(" ")[1];

  if (authHeader) {
    jwt.verify(token, process.env.JWT_PASSKEY, (err, user) => {
      if (err) res.status(403).json("Token isn't valid");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("User not authenticated");
  }
};
//This middleware will be used to authenticate any user
const verifyAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("you don't have required permission!");
    }
  });
};

//This middleware will be used when some action requires admin permission
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("you don't have required admin permission!");
    }
  });
};

module.exports = { verifyToken, verifyAndAuthorization, verifyAdmin };
