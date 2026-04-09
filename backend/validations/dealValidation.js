const Joi = require("joi");

const createDealSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  stage: Joi.string().valid("NEW", "NEGOTIATION", "DUE_DILIGENCE", "CLOSED", "CANCELLED").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "COMPLETED").optional(),
  startupIds: Joi.array().items(Joi.number().integer()).optional(),
  investorIds: Joi.array().items(Joi.number().integer()).optional(),
});

const updateDealSchema = Joi.object({
  amount: Joi.number().min(0).optional(),
  stage: Joi.string().valid("NEW", "NEGOTIATION", "DUE_DILIGENCE", "CLOSED", "CANCELLED").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "COMPLETED").optional(),
  startupIds: Joi.array().items(Joi.number().integer()).optional(),
  investorIds: Joi.array().items(Joi.number().integer()).optional(),
});

module.exports = { createDealSchema, updateDealSchema };
