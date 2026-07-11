const { body } = require('express-validator');

/**
 * Validation rules for user registration.
 * Includes conditional validation for Patient and Doctor fields.
 */
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
    
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isIn(['Admin', 'Doctor', 'Patient']).withMessage('Role must be Admin, Doctor, or Patient'),

  // Conditional validations for Patients
  body('phone')
    .if(body('role').equals('Patient'))
    .trim()
    .notEmpty().withMessage('Phone number is required for patients')
    .isMobilePhone().withMessage('Please provide a valid phone number'),

  body('age')
    .if(body('role').equals('Patient'))
    .notEmpty().withMessage('Age is required for patients')
    .isInt({ min: 0, max: 120 }).withMessage('Age must be a valid number between 0 and 120'),

  body('gender')
    .if(body('role').equals('Patient'))
    .trim()
    .notEmpty().withMessage('Gender is required for patients')
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

  // Conditional validations for Doctors
  body('specialization')
    .if(body('role').equals('Doctor'))
    .trim()
    .notEmpty().withMessage('Specialization is required for doctors'),

  body('experience')
    .if(body('role').equals('Doctor'))
    .notEmpty().withMessage('Years of experience is required for doctors')
    .isInt({ min: 0, max: 80 }).withMessage('Experience must be a positive integer'),

  body('clinic')
    .if(body('role').equals('Doctor'))
    .trim()
    .notEmpty().withMessage('Clinic location/name is required for doctors'),

  body('fees')
    .if(body('role').equals('Doctor'))
    .notEmpty().withMessage('Consultation fees is required for doctors')
    .isFloat({ min: 0 }).withMessage('Fees must be a positive number')
];

/**
 * Validation rules for user login.
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty().withMessage('Password is required')
];

module.exports = {
  registerValidator,
  loginValidator
};
