import { z } from 'zod';

export const cadastroSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres'),

  email: z
    .string()
    .email('Email inválido'),

  senha: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido'),

  senha: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const climaSchema = z.object({
  cidade: z
    .string()
    .min(2, 'Nome da cidade inválido'),
});

export const historicoSchema = z.object({
  cidade: z
    .string()
    .min(2, 'Nome da cidade inválido'),

  temperatura: z
    .number(),

  condicao: z
    .string()
    .min(2, 'Condição inválida'),

  recomendacao: z
    .string()
    .min(2, 'Recomendação inválida'),
});