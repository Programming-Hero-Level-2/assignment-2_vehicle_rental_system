import jwt, {
  SignOptions,
  Algorithm,
  JwtPayload as JwtLibPayload,
} from 'jsonwebtoken';
import config from '../../config';

export type JwtPayload = Record<string, unknown>;

export interface GenerateTokenOptions {
  payload: JwtPayload;
  secret?: string;
  algorithm?: Algorithm;
  expiresIn?: JwtLibPayload['exp'];
}

export interface DecodeTokenOptions {
  token: string;
}

export interface VerifyTokenOptions {
  token: string;
  secret?: string;
  algorithm?: Algorithm;
}

export const generateToken = ({
  payload,
  secret = config.ACCESS_TOKEN_SECRET,
  algorithm = 'HS256',
  expiresIn = 1600,
}: GenerateTokenOptions): string => {
  try {
    const options: SignOptions = { algorithm, expiresIn };
    return jwt.sign(payload, secret as jwt.Secret, options);
  } catch (err) {
    console.error('[JWT generateToken]:', err);
    throw new Error('Server Error');
  }
};

export const decodeToken = ({
  token,
}: DecodeTokenOptions): null | string | JwtLibPayload => {
  try {
    return jwt.decode(token) as null | string | JwtLibPayload;
  } catch (err) {
    console.error('[JWT decodeToken]:', err);
    throw new Error('Server Error');
  }
};

export const verifyToken = ({
  token,
  secret = config.ACCESS_TOKEN_SECRET!,
  algorithm = 'HS256',
}: VerifyTokenOptions): string | JwtLibPayload => {
  try {
    return jwt.verify(token, secret, { algorithms: [algorithm] }) as
      | string
      | JwtLibPayload;
  } catch (err) {
    console.error('[JWT verifyToken]:', err);
    throw new Error('Server Error');
  }
};

export default {
  generateToken,
  decodeToken,
  verifyToken,
};
