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
} from './schemas/userSchema';

const router = Router();


// Cadastro
router.post('/cadastro', async (req, res) => {

  const validacao = cadastroSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      erros: validacao.error.format(),
    });
  }

  const { email, senha } = validacao.data;

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


// Login
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


// Clima
router.post(
  '/clima',
  autorizarUsuario,
  async (req, res) => {

    const validacao = climaSchema.safeParse(req.body);

    if (!validacao.success) {
      return res.status(400).json({
        erros: validacao.error.format(),
      });
    }

    const { cidade } = validacao.data;

    const usuarioId = req.usuarioId;

    try {

      const apiKey = process.env.OPENWEATHER_API_KEY;

      const urlExterna =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

      const respostaOpenWeather = await axios.get(urlExterna);

      const temperatura =
        respostaOpenWeather.data.main.temp;

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

      const novaPesquisa =
        await prisma.climaPesquisado.create({
          data: {
            cidade,
            temperatura,
            recomendacao,
            usuarioId: usuarioId!,
          },
        });

      return res.json({
        cidade: novaPesquisa.cidade,
        temperatura: novaPesquisa.temperatura,
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
  }
);

export default router;