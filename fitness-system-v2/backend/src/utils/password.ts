import bcrypt from 'bcryptjs';

export class PasswordService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * 哈希密码
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * 验证密码
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 验证密码强度
   */
  static validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (!password || password.length < 6) {
      return { isValid: false, message: '密码长度至少6位' };
    }

    if (password.length > 128) {
      return { isValid: false, message: '密码长度不能超过128位' };
    }

    // 检查是否包含至少一个数字和一个字母
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    if (!hasNumber || !hasLetter) {
      return { isValid: false, message: '密码应包含至少一个数字和一个字母' };
    }

    return { isValid: true, message: '密码强度合格' };
  }

  /**
   * 生成随机密码
   */
  static generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}

export default PasswordService;