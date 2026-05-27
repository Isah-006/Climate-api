import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

import prisma from './prismaClient';
import { autorizarUsuario } from './auth';

const router = Router();

// ==========================================
// ROTA 1: CADASTRO DE USUÁRIO
// APIDog: POST /register
// ==========================================
router.post('/register', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: 'Informe email e senha.',
    });
  }

  try {
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExiste) {
      return res.status(400).json({
        erro: 'Este email já está cadastrado.',
      });
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
      usuarioId: novoUsuario.id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: 'Erro interno no servidor.',
    });
  }
});

// ==========================
// ROTA 2: LOGIN DE USUÁRIO
// APIDog: POST /login
// ==========================================
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: 'Informe email e senha.',
    });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Senha incorreta.',
      });
    }

    const token = jwt.sign(
      { id: usuario.id },
      'senha_secreta_da_faculdade',
      { expiresIn: '1d' }
    );

    return res.json({
      mensagem: 'Login efetuado com sucesso!',
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: 'Erro interno no servidor.',
    });
  }
});

// ==========================================
// ROTA 3: CONSULTAR CLIMA POR CIDADE
// APIDog: GET /clima/{cidade}
// No Express: GET /clima/:cidade
// ==========================================
router.get('/clima/:cidade', autorizarUsuario, async (req, res) => {
  const cidade = String(req.params.cidade);

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const urlExterna = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      cidade
    )}&appid=${apiKey}&units=metric&lang=pt_br`;

    const respostaOpenWeather = await axios.get(urlExterna);

    const temperatura = respostaOpenWeather.data.main.temp;
    const condicao = respostaOpenWeather.data.weather[0].description;

    let recomendacao = '';

    if (temperatura >= 30) {
      recomendacao =
        'Está muito quente! Beba muita água, ligue o ventilador e faça pausas curtas para estudar.';
    } else if (temperatura <= 15) {
      recomendacao =
        'Está frio! Pegue um café ou chá quente, um cobertor e foco total nos estudos!';
    } else {
      recomendacao =
        'O clima está ótimo e agradável! Condições perfeitas para bater as suas metas de estudo hoje.';
    }

    return res.json({
      cidade,
      temperatura,
      condicao,
      recomendacao,
    });
  } catch (error: any) {
    console.error(
      'ERRO DETALHADO:',
      error.response ? error.response.data : error.message
    );

    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        erro: 'Cidade não encontrada.',
      });
    }

    return res.status(500).json({
      erro: 'Erro interno ou na API externa.',
    });
  }
});

// ==========================================
// ROTA 4: SALVAR HISTÓRICO DE CONSULTA
// APIDog: POST /historico
// ==========================================
router.post('/historico', autorizarUsuario, async (req, res) => {
  const { cidade, temperatura, recomendacao } = req.body;
  const usuarioId = req.usuarioId;

  if (!cidade || temperatura === undefined || !recomendacao) {
    return res.status(400).json({
      erro: 'Informe cidade, temperatura e recomendacao.',
    });
  }

  try {
    const novoHistorico = await prisma.climaPesquisado.create({
      data: {
        cidade,
        temperatura,
        recomendacao,
        usuarioId: usuarioId!,
      },
    });

    return res.status(201).json({
      mensagem: 'Histórico salvo com sucesso!',
      historico: {
        id: novoHistorico.id,
        cidade: novoHistorico.cidade,
        temperatura: novoHistorico.temperatura,
        recomendacao: novoHistorico.recomendacao,
        data: novoHistorico.dataPesquisa,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: 'Erro interno no servidor.',
    });
  }
});

// ==========================================
// ROTA 5: LISTAR HISTÓRICO
// APIDog: GET /historico
// ==========================================
router.get('/historico', autorizarUsuario, async (req, res) => {
  const usuarioId = req.usuarioId;

  try {
    const historico = await prisma.climaPesquisado.findMany({
      where: {
        usuarioId: usuarioId!,
      },
      orderBy: {
        dataPesquisa: 'desc',
      },
    });

    return res.json(historico);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: 'Erro interno no servidor.',
    });
  }
});

export default router;
