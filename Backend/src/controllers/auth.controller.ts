import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import User from '../models/User.model.js';
import * as R from '../utils/apiResponse.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser(name, email, password);
    res.status(201).json(R.success(result, 'Account created', 201));
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json(R.success(result));
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json(R.success(tokens));
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logoutUser(req.user!.userId);
    res.json(R.success(null, 'Logged out'));
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) { res.status(404).json(R.failure('User not found', 404)); return; }
    res.json(R.success({ _id: user._id, name: user.name, email: user.email, currency: user.currency, avatar: user.avatar }));
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.user!.userId, req.body, { new: true });
    if (!user) { res.status(404).json(R.failure('User not found', 404)); return; }
    res.json(R.success({ _id: user._id, name: user.name, email: user.email, currency: user.currency }));
  } catch (err) {
    next(err);
  }
};
