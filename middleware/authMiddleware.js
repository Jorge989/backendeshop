const jwt = require("jsonwebtoken");
const User = require("../models/User");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;
    const decodedToken = jwt.verify(token, secret);
    const userId = decodedToken.id;

    User.findById(userId, "-password")
      .then((user) => {
        if (!user) {
          return res.status(404).json({ msg: "Usuário não encontrado!" });
        }
        req.user = user._doc;
        next();
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ msg: "Erro ao buscar usuário!" });
      });
  } catch (error) {
    res.status(400).json({ msg: "Token inválido!" });
  }
}

module.exports = authMiddleware;
