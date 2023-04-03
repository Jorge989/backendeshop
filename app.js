require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const mongoose = require("mongoose");

// Configurações
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Conexão com o Banco de Dados
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.gvqpwpf.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectado ao banco de dados!");
  })
  .catch((err) => console.log(err));

// Rotas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
