/**
 * 日志工具类
 * 提供统一的日志记录功能
 */
class Logger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  private static getLogLevel(level: string): string {
    return `[${level.toUpperCase()}]`;
  }

  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = this.getTimestamp();
    const logLevel = this.getLogLevel(level);
    const baseMessage = `${timestamp} ${logLevel} ${message}`;

    if (meta) {
      return `${baseMessage} ${JSON.stringify(meta)}`;
    }

    return baseMessage;
  }

  /**
   * 信息日志
   */
  static info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  /**
   * 警告日志
   */
  static warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  /**
   * 错误日志
   */
  static error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }

  /**
   * 调试日志
   */
  static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  /**
   * 认证相关日志
   */
  static auth = {
    loginAttempt: (username: string, ip?: string) => {
      Logger.info(`🔐 登录尝试`, { username, ip, action: 'login_attempt' });
    },

    loginSuccess: (username: string, userId: number, ip?: string) => {
      Logger.info(`✅ 登录成功`, { username, userId, ip, action: 'login_success' });
    },

    loginFailed: (username: string, reason: string, ip?: string) => {
      Logger.warn(`❌ 登录失败`, { username, reason, ip, action: 'login_failed' });
    },

    logout: (username?: string, userId?: number, ip?: string) => {
      Logger.info(`🚪 用户登出`, { username, userId, ip, action: 'logout' });
    },

    tokenRefresh: (username?: string, userId?: number, ip?: string) => {
      Logger.info(`🔄 Token 刷新`, { username, userId, ip, action: 'token_refresh' });
    },

    tokenRefreshFailed: (reason: string, ip?: string) => {
      Logger.warn(`❌ Token 刷新失败`, { reason, ip, action: 'token_refresh_failed' });
    },

    unauthorized: (reason: string, ip?: string) => {
      Logger.warn(`🚫 未授权访问`, { reason, ip, action: 'unauthorized' });
    }
  };

  /**
   * 用户相关日志
   */
  static user = {
    created: (username: string, userId: number, role: string) => {
      Logger.info(`👤 用户创建`, { username, userId, role, action: 'user_created' });
    },

    updated: (username: string, userId: number, changes: string[]) => {
      Logger.info(`📝 用户更新`, { username, userId, changes, action: 'user_updated' });
    },

    deleted: (username: string, userId: number) => {
      Logger.warn(`🗑️ 用户删除`, { username, userId, action: 'user_deleted' });
    },

    passwordChanged: (username: string, userId: number) => {
      Logger.info(`🔑 密码修改`, { username, userId, action: 'password_changed' });
    }
  };

  /**
   * 系统相关日志
   */
  static system = {
    startup: (message: string) => {
      Logger.info(`🚀 系统启动`, { message, action: 'system_startup' });
    },

    shutdown: (message: string) => {
      Logger.info(`🛑 系统关闭`, { message, action: 'system_shutdown' });
    },

    database: (action: string, details?: any) => {
      Logger.info(`💾 数据库操作`, { action, ...details });
    },

    error: (error: Error, context?: string) => {
      Logger.error(`💥 系统错误`, {
        error: error.message,
        stack: error.stack,
        context,
        action: 'system_error'
      });
    }
  };

  /**
   * 获取客户端IP地址
   */
  static getClientIP(req: any): string | undefined {
    return req.ip ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.connection?.socket?.remoteAddress;
  }
}

export default Logger;
