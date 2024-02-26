const { expressjwt } = require("express-jwt");

require("dotenv/config");


function authJwt() {
  const secret = process.env.secret;

  return expressjwt({
    secret,
    algorithms: ["HS256"],
//    isRevoked: isRevoked,
  }).unless({
    // Specify routes that don't require authentication
    path: [
      { url: /\/public\/upload(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      "/api/v1/users/user/login",
      "/api/v1/users/register",
      // "/api/v1/products",
      // "/api/v1/categories",
      // "/api/v1/products/:id",
    ],
  });
}

// async function isRevoked(req, payload, done) {
//   if (!payload.isAdmin) {
//     // User is not an admin, revoke access
//     console.warn('notAdmin');
//     done(null, true);
//   } else {
//     // User is an admin, allow access
//     console.warn('Admin');
//     done();
//   }
// }

module.exports = authJwt;
