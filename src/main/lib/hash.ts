import crypto from 'crypto';

export const generateHash = ({
  input,
  length = 11,
  encoding = 'base64',
}: {
  input?: string;
  length?: number;
  encoding?: crypto.BinaryToTextEncoding;
} = {}) => {
  return crypto
    .createHash('sha512')
    .update(input || process.hrtime.bigint().toString())
    .digest(encoding)
    .slice(0, length);
};
