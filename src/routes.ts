import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import prisma from './prismaClient';
import { autorizarUsuario } from './auth'; 

const router = Router();

// ==========================================
// ROTA 1: CADASTRO DE USUÁRIO
// ==========================================
router.post('/cadastro', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuarioExiste = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ erro: 'Este email já está cadastrado.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        email,
        senha: senhaCriptografada,
      },
    });

    return res.status(201).json({ 
      mensagem: 'Usuário criado com sucesso!', 
      usuarioId: novoUsuario.id 
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ==========================================
// ROTA 2: LOGIN (GERA O TOKEN JWT)
// ==========================================
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }

    const token = jwt.sign({ id: usuario.id }, 'senha_secreta_da_faculdade', {
      expiresIn: '1d',
    });

    return res.json({ 
      mensagem: 'Login efetuado com sucesso!', 
      token 
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ==========================================
// ROTA 3: BUSCAR CLIMA E GERAR RECOMENDAÇÃO (PROTEGIDA)
// ==========================================
router.post('/clima', autorizarUsuario, async (req, res) => {
  const { cidade } = req.body;
  const usuarioId = req.usuarioId; 

  if (!cidade) {
    return res.status(400).json({ erro: 'Por favor, informe o nome da cidade.' });
  }

  try {
    // Pega a chave da API do arquivo .env
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const urlExterna = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    // 1. Faz a requisição para a API do OpenWeatherMap
    console.log("Minha chave é:", process.env.OPENWEATHER_API_KEY);
    const respostaOpenWeather = await axios.get(urlExterna);
    const temperatura = respostaOpenWeather.data.main.temp;

    // 2. Regra de Negócio: Gerar recomendação
    let recomendacao = '';
    if (temperatura >= 30) {
      recomendacao = 'Está muito quente! Beba muita água, ligue o ventilador e faça pausas curtas para estudar.';
    } else if (temperatura <= 15) {
      recomendacao = 'Está frio! Pegue um café ou chá quente, um cobertor e foco total nos estudos!';
    } else {
      recomendacao = 'O clima está ótimo e agradável! Condições perfeitas para bater as suas metas de estudo hoje.';
    }

    // 3. Salva no banco de dados
    const novaPesquisa = await prisma.climaPesquisado.create({
      data: {
        cidade,
        temperatura,
        recomendacao,
        usuarioId: usuarioId!
      }
    });

    // 4. Devolve para o Frontend
    return res.json({
      cidade: novaPesquisa.cidade,
      temperatura: novaPesquisa.temperatura,
      recomendacao: novaPesquisa.recomendacao,
      data: novaPesquisa.dataPesquisa
    });

  } catch (error: any) {
    console.error("ERRO DETALHADO:", error.response ? error.response.data : error.message);

    if (error.response && error.response.status === 404) {
      return res.status(404).json({ erro: 'Cidade não encontrada.' });
    }
    return res.status(500).json({ erro: 'Erro interno ou na API externa.' });
  }
});

export default router;