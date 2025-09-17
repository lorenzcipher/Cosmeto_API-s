import Joi from 'joi';

export const userSignUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required(),
});

export const userSignInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const userUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().min(2).max(50).optional(),
  role: Joi.string().valid('admin', 'user').optional(),
});

export const eventSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  date: Joi.date().iso().required(),
  location: Joi.string().min(3).max(200).required(),
  maxAttendees: Joi.number().min(1).optional().allow(null),
  isPublic: Joi.boolean().optional(),
  category: Joi.string().valid('conference', 'workshop', 'meetup', 'webinar', 'social', 'other').required(),
});

export const eventUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  date: Joi.date().iso().optional(),
  location: Joi.string().min(3).max(200).optional(),
  maxAttendees: Joi.number().min(1).optional().allow(null),
  isPublic: Joi.boolean().optional(),
  category: Joi.string().valid('conference', 'workshop', 'meetup', 'webinar', 'social', 'other').optional(),
});