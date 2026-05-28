import jwt from 'jsonwebtoken';

import prisma from '../lib/prisma.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Ekstrak token
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          level: true,
        },
      });

      if (!currentUser) {
        return res.status(401).json({
          status: 'fail',
          message: 'Pengguna dari token ini sudah tidak ada',
        });
      }

      req.user = currentUser;

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        status: 'fail',
        message: 'Sesi tidak valid atau telah kedaluwarsa',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Anda belum login. Silakan login untuk mendapatkan akses',
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Akses ditolak. Endpoint ini hanya untuk Admin.',
    });
  }
};

export { adminOnly, protect };
