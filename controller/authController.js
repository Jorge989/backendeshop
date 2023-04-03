const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  //validations
  if (!password || !confirmPassword || password !== confirmPassword) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }
  if (password.length < 6 || confirmPassword.length < 6) {
    return res
      .status(422)
      .json({ msg: "A senha deve conter pelo menos 6 caracteres!" });
  }
  if (!username || !email) {
    return res.status(422).json({ msg: "Credenciais são obrigatórias!" });
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail" });
  }

  //* create password
  const salt = await bcrypt.genSalt(12);
  const paswordHash = await bcrypt.hash(password, salt);
  const user = new User({
    username,
    email,
    password: paswordHash,
  });

  // register user logic
  try {
    await user.save();
    return res.status(200).json({ msg: user });
  } catch (err) {
    console.log("🚀 ~ file: authController.js:35 ~ signup ~ err:", err);
    return res.status(500).json({ msg: "Erro ao registrar usuário!" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  //*validations
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  //*check if user exists
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ msg: "Usuário não indentificado!" });
  }

  //*check if password match
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1h" });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ msg: "Erro ao gerar o token!" });
  }
};
module.exports = {
  signup,
  login,
};
