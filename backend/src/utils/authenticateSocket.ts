import {Socket} from 'socket.io';
import {Request, Response} from 'express';
import passport from 'passport';
import logger from './logger.js';
// Custom error class for socket errors
class SocketError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SocketError';
  }
}

// Extended Socket interface with auth user
interface AuthenticatedSocket extends Socket {
  user?: any;
  data: {
    userId?: string;
    lectureid?: string;
    unsubscribeLecture?: () => void;
  };
}

// Authentication middleware for sockets
const authenticateSocket = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(
      new SocketError('Authentication token is missing', 'AUTH_ERROR'),
    );
  }

  const req = {headers: {authorization: `Bearer ${token}`}} as Request;
  const res = {} as Response;
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err) {
      logger.error('Socket token verification failed:', err.message);
      return next(new SocketError('Invalid token', 'AUTH_ERROR'));
    }
    if (!user) {
      logger.error('No user found:', info?.message || 'No auth token');
      return next(new SocketError('Invalid token', 'AUTH_ERROR'));
    }
    socket.user = user;
    next();
  })(req, res, next);
};
export {authenticateSocket, AuthenticatedSocket, SocketError};
