import Joi from "joi";

// User Registration Validation
export const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    address: Joi.string().max(200).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// User Login Validation
export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Order Validation
export const validateOrder = (req, res, next) => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        foodId: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        image: Joi.string().optional()
      })
    ).min(1).required(),
    totalAmount: Joi.number().positive().required(),
    deliveryAddress: Joi.string().min(10).max(500).required(),
    paymentMethod: Joi.string().valid("COD", "Online").required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Food Item Validation
export const validateFood = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().positive().required(),
    image: Joi.string().uri().required(),
    category: Joi.string().required(),
    description: Joi.string().max(500).optional(),
    rating: Joi.number().min(0).max(5).optional(),
    isAvailable: Joi.boolean().optional(),
    isVeg: Joi.boolean().optional(),
    discountPrice: Joi.number().min(0).optional(),
    isPopular: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
