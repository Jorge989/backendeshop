const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async create(req, res) {
    const { username, email, password, confirmPassword } = req.body;

    //validations
    if (!password || !confirmPassword || password !== confirmPassword) {
      return res.status(422).json({ msg: "As senhas não conferem!" });
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
      return res.status(200).json({
        // msg: "Usuário registrado com sucesso!",
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: "Erro ao registrar usuário!" });
    }
  },

  async authenticate(req, res) {
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
    const checkPasswor = await bcrypt.compare(password, user.password);
    if (!checkPasswor) {
      return res.status(422).json({ msg: "Senha inválida!" });
    }
    try {
      const secret = process.env.SECRET;
      const token = jwt.sign(
        {
          id: user._id,
        },
        secret
      );
      res
        .status(200)
        .json({ msg: "Autenticação relaizada com sucesso", token });
    } catch (err) {
      console.log(error);
      res.status(500).json({
        msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
      });
    }
  },

  async show(req, res) {
    const id = req.params.id;
    //*check if user exists
    const user = await User.findById(id, "-password");
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }
    if (user) {
      return res.status(200).json(user._doc);
    }
  },
};
