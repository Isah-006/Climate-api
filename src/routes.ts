import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

import prisma from './prismaClient';
import { autorizarUsuario } from './auth';

import {
  cadastroSchema,
  loginSchema,
  climaSchema,
  historicoSchema,
} from './schemas/userSchema';

const router = Router();


// Cadastro de usuário - APIDOG: POST /register
router.post('/register', async (req, res) => {

  const validacao = cadastroSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      erros: validacao.error.format(),
    });
  }

  const { nome, email, senha } = validacao.data;

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
        nome,
        email,
        senha: senhaCriptografada,
      },
    });

    return res.status(200).json({
      mensagem: 'Usuário criado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      erro: 'Erro interno no servidor.',
    });
  }
});


// Login de usuário - APIDOG: POST /login
router.post('/login', async (req, res) => {

  const validacao = loginSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      erros: validacao.error.format(),
    });
  }

  const { email, senha } = validacao.data;

  try {

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Senha incorreta.',
      });
    }

    const token = jwt.sign(
      { id: usuario.id },
      'senha_secreta_da_faculdade',
      {
        expiresIn: '1d',
      }
    );

    return res.status(200).json({
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


// Consultar clima por cidade - APIDOG: GET /clima/{cidade}
router.get('/clima/:cidade', autorizarUsuario, async (req, res) => {

  const validacao = climaSchema.safeParse(req.params);

  if (!validacao.success) {
    return res.status(400).json({
      erros: validacao.error.format(),
    });
  }

  const { cidade } = validacao.data;
  const usuarioId = req.usuarioId;

  try {

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        erro: 'Chave da API OpenWeather não configurada.',
      });
    }

    const urlExterna =
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    const respostaOpenWeather = await axios.get(urlExterna);

    const temperatura = Math.round(respostaOpenWeather.data.main.temp);

    const condicao =
      respostaOpenWeather.data.weather?.[0]?.description || 'Condição não informada';

    let recomendacao = '';

    if (temperatura >= 30) {

      recomendacao =
        'Está muito quente! Beba bastante água e faça pausas curtas nos estudos.';

    } else if (temperatura <= 15) {

      recomendacao =
        'Está frio! Um café e um cobertor podem ajudar no foco.';

    } else {

      recomendacao =
        'Clima agradável, ótimo momento para estudar e bater as metas do dia.';
    }

    const novaPesquisa = await prisma.climaPesquisado.create({
      data: {
        cidade,
        temperatura,
        condicao,
        recomendacao,
        usuarioId: usuarioId!,
      },
    });

    return res.status(200).json({
      cidade: novaPesquisa.cidade,
      temperatura: novaPesquisa.temperatura,
      condicao: novaPesquisa.condicao,
      recomendacao: novaPesquisa.recomendacao,
      data: novaPesquisa.dataPesquisa,
    });

  } catch (error: any) {

    console.error(
      error.response
        ? error.response.data
        : error.message
    );

    if (
      error.response &&
      error.response.status === 404
    ) {
      return res.status(404).json({
        erro: 'Cidade não encontrada.',
      });
    }

    return res.status(500).json({
      erro: 'Erro interno ou na API externa.',
    });
  }
});


// Salvar histórico - APIDOG: POST /historico
router.post('/historico', autorizarUsuario, async (req, res) => {

  const validacao = historicoSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      erros: validacao.error.format(),
    });
  }

  const { cidade, temperatura, condicao, recomendacao } = validacao.data;
  const usuarioId = req.usuarioId;

  try {

    const novoHistorico = await prisma.climaPesquisado.create({
      data: {
        cidade,
        temperatura,
        condicao,
        recomendacao,
        usuarioId: usuarioId!,
      },
    });

    return res.status(200).json({
      mensagem: 'Histórico salvo com sucesso!',
      historico: {
        id: novoHistorico.id,
        cidade: novoHistorico.cidade,
        temperatura: Math.round(novoHistorico.temperatura),
        condicao: novoHistorico.condicao,
        recomendacao: novoHistorico.recomendacao,
        data: novoHistorico.dataPesquisa,
      },
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      erro: 'Erro interno ao salvar histórico.',
    });
  }
});


// Listar histórico - APIDOG: GET /historico
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

    return res.status(200).json(
  historico.map((item) => ({
    id: item.id,
    cidade: item.cidade,
    temperatura: Math.round(item.temperatura),
    condicao: item.condicao,
    recomendacao: item.recomendacao,
    data: item.dataPesquisa,
  }))
);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      erro: 'Erro interno ao listar histórico.',
    });
  }
});


export default router;