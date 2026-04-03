import { User } from '../models/User.model.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });

  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: { _id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const valid = await comparePassword(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: { _id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
    refreshToken,
  };
};

export const refreshTokens = async (token: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  const user = await User.findById(payload.userId).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw Object.assign(new Error('Refresh token reuse detected'), { statusCode: 401 });
  }

  const newPayload = { userId: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const logoutUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: undefined });
};
