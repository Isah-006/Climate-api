import { z } from 'zod';

export const cadastroSchema = z.object({
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