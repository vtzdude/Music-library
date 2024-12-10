import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();
export interface IAppConfig {
  projectName: string;
  logLevel: string;
  allowedOrigin: string;
  port: number;
  url: string;
  sessionCount: number;
}

export interface IConfig {
  nodeEnv: string;
  admin: {
    userId: string;
    email: string;
    password: string;
    referralCode: string;
    walletAddress;
  };
  salt: number;
  jwtSecret: string;
  jwtExpiry: string;
  tokenExpiry: string;
  otpExpireTime: number;
  otpResendCount: number;
  diffTime: number;
  platformLiteral: string;
  database: {
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
    dialect: string;
    logging: boolean;
    ssl: boolean;
  };
  mail: {
    host: string;
    user: string;
    password: string;
  };
  queue: {
    url: string;
    mailQueue: string;
    traversalQueue: string;
  };
  previousPasswordLimit: number;
  redisURL: string;
  allowedSessions: number;
  matchingBonusPercent: number;
  incomeUtcTime: number;
  rpc: string;
  contractAddress: string;
  pageLimit: number;
  cronExpression: string;
  levelIncomeLevel: number;
  levelBonusPercent: number;
  minWithdrawalLimit: number;
  developers: string;
  validation: {
    nameMin: number;
    nameMax: number;
    emailMin: number;
    emailMax: number;
    passwordMin: number;
    passwordMax: number;
    testingEmail: string[];
    tldsLength: number;
  };
  adminJwtSecret: string;
  allowedAdminSessions: number;
  otpResendtime: number;
  wrongOtpCount: number;
}
const configService = new ConfigService();

export const APP_CONFIG: IAppConfig = {
  projectName: configService.get('PROJECT_NAME'),
  logLevel: configService.get('LOG_LEVEL'),
  allowedOrigin: configService.get('ALLOWED_ORIGIN'),
  port: configService.get('PORT'),
  url: configService.get('APP_URL'),
  sessionCount: configService.get('SESSION_COUNT'),
};
export const CONFIG: IConfig = {
  nodeEnv: configService.get('NODE_ENV'),
  admin: {
    userId: configService.get('ADMIN_USERID'),
    email: configService.get('ADMIN_EMAIL'),
    password: configService.get('ADMIN_PASSWORD'),
    referralCode: configService.get('ADMIN_REFERRAL_CODE'),
    walletAddress: configService.get('ADMIN_WALLET_ADDRESS'),
  },
  salt: Number(configService.get('BCRYPT_SALT')),
  jwtSecret: configService.get('JWT_SECRET'),
  jwtExpiry: configService.get('JWT_EXPIRES_IN'),
  tokenExpiry: configService.get('TOKEN_EXPIRATION'),
  otpExpireTime: configService.get('OTP_EXPIRE_TIME'),
  otpResendCount: configService.get('OTP_RESEND_COUNT'),
  diffTime: configService.get('DIFF_TIME'),
  platformLiteral: configService.get('PLATFORM_LITERAL'),
  database: {
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    dialect: configService.get('DB_DIALECT'),
    // logging: configService.get('DB_LOGGING') === 'true', TODO: uncomment it
    logging: false,
    ssl: configService.get('DB_SSL') === 'true',
  },
  mail: {
    host: configService.get('MAIL_HOST'),
    user: configService.get('MAIL_AUTH_USER'),
    password: configService.get('MAIL_AUTH_PASSWORD'),
  },
  queue: {
    url: configService.get('QUEUE_URL'),
    mailQueue: configService.get('MAIL_QUEUE'),
    traversalQueue: configService.get('TRAVERSAL_QUEUE'),
  },
  previousPasswordLimit: +configService.get('PREVOUS_PASSWORD_LIMIT'),
  redisURL: configService.get('REDIS_URL'),
  allowedSessions: +configService.get('ALLOWED_SESSIONS'),
  matchingBonusPercent: +configService.get('MATCHING_BONUS_PERCENT'),
  incomeUtcTime: +configService.get('INCOME_UTC_TIME'),
  rpc: configService.get('RPC_URL'),
  contractAddress: configService.get('CONTRACT_ADDRESS'),
  pageLimit: +configService.get('PAGE_LIMIT'),
  cronExpression: configService.get('CRON_EXP'),
  levelIncomeLevel: +configService.get('LEVEL_INCOME_LEVEL'),
  levelBonusPercent: +configService.get('LEVEL_BONUS_PERCENT'),
  minWithdrawalLimit: +configService.get('MIN_WITHDRAWAL_LIMIT'),
  developers: configService.get('DEVELOPERS'),
  validation: {
    nameMin: +configService.get('NAME_MIN'),
    nameMax: +configService.get('NAME_MAX'),
    emailMin: +configService.get('EMAIL_MIN'),
    emailMax: +configService.get('EMAIL_MAX'),
    passwordMin: +configService.get('PASSWORD_MIN'),
    passwordMax: +configService.get('PASSWORD_MAX'),
    testingEmail: configService.get('TESTING_EMAIL'),
    tldsLength: +configService.get('TLDS_LENGTH'),
  },
  adminJwtSecret: configService.get('ADMIN_JWT_SECRET'),
  allowedAdminSessions: +configService.get('ALLOWED_ADMIN_SESSIONS'),
  otpResendtime: +configService.get('OTP_RESEND_SECONDS'),
  wrongOtpCount: +configService.get('WRONG_OTP_COUNT'),
};
