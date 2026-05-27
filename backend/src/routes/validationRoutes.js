const express = require('express');
const {
  validateLogin,
  validateRegister
} = require('../validators/authValidator');
const {
  validateAssignment
} = require('../validators/assignmentValidator');

const router = express.Router();

function sendValidationResponse(res, errors) {
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ isValid: false, errors });
  }
  return res.json({ isValid: true, errors: {} });
}

router.post('/auth/login', (req, res) => {
  const errors = validateLogin(req.body || {});
  return sendValidationResponse(res, errors);
});

router.post('/auth/register', (req, res) => {
  const errors = validateRegister(req.body || {});
  return sendValidationResponse(res, errors);
});

router.post('/assignments', (req, res) => {
  const errors = validateAssignment(req.body || {});
  return sendValidationResponse(res, errors);
});

module.exports = router;
