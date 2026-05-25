import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: "A API de Clima e Estudos está a funcionar perfeitamente! 🚀" });
});

app.listen(3000, () => {
  console.log('Servidor a correr na porta 3000');
});