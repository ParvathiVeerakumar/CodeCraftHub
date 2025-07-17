const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.createUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('Email already exists');
  }
  const user = new User(data);
  await user.save();
  return { id: user._id, name: user.name, email: user.email };
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return { token, user: { id: user._id, name: user.name, email: user.email } };
};
