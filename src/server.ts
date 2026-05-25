import express from 'express';
import routes from './routes';

const app = express();

// Permite que a nossa API entenda dados em formato JSON
app.use(express.json());

app.use(express.static('public'));

// Adiciona as nossas rotas criadas no outro arquivo
app.use(routes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000 🚀');
});