import {Nfsv4Stat} from '../../..';
import type {Logger} from '../../types';

export const isErrCode = (code: unknown, error: unknown): boolean =>
  !!error && typeof error === 'object' && (error as any).code === code;

export const normalizeNodeFsError = (err: unknown, logger: Logger): Nfsv4Stat => {
  if (isErrCode('ENOENT', err)) return Nfsv4Stat.NFS4ERR_NOENT;
  if (isErrCode('EACCES', err)) return Nfsv4Stat.NFS4ERR_ACCESS;
  if (isErrCode('EEXIST', err)) return Nfsv4Stat.NFS4ERR_EXIST;
  if (isErrCode('ENOTDIR', err)) return Nfsv4Stat.NFS4ERR_NOTDIR;
  if (isErrCode('EISDIR', err)) return Nfsv4Stat.NFS4ERR_ISDIR;
  if (isErrCode('EINVAL', err)) return Nfsv4Stat.NFS4ERR_INVAL;
  if (isErrCode('ENOTEMPTY', err)) return Nfsv4Stat.NFS4ERR_NOTEMPTY;
  if (isErrCode('ENOSPC', err)) return Nfsv4Stat.NFS4ERR_NOSPC;
  if (isErrCode('EROFS', err)) return Nfsv4Stat.NFS4ERR_ROFS;
  if (isErrCode('EXDEV', err)) return Nfsv4Stat.NFS4ERR_XDEV;
  if (isErrCode('EFBIG', err)) return Nfsv4Stat.NFS4ERR_FBIG;
  if (isErrCode('EMLINK', err)) return Nfsv4Stat.NFS4ERR_MLINK;
  if (isErrCode('ENAMETOOLONG', err)) return Nfsv4Stat.NFS4ERR_NAMETOOLONG;
  logger.error('UNEXPECTED_FS_ERROR', err);
  return Nfsv4Stat.NFS4ERR_IO;
};
