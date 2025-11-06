const Joi = require('joi');

const idParamSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required(),
});

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  completed: Joi.boolean().required(),
});

const patchCompletedSchema = Joi.object({
  completed: Joi.boolean().optional(),
});

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      return next({
        statusCode: 400,
        message: 'Validation error',
        details: error.details.map((d) => ({ message: d.message, path: d.path })),
      });
    }
    // assign back sanitized values
    req[property] = value;
    return next();
  };
}

module.exports = {
  validate,
  idParamSchema,
  createTaskSchema,
  updateTaskSchema,
  patchCompletedSchema,
};

