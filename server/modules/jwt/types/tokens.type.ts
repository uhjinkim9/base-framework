export type TokenPayloadInfo = {
  userId: string;
  deviceId: string;
  userAgent: string;
  loginIp: string;
  roleId: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
  existingUser?: any;
};
