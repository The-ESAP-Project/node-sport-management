import argon2 from 'argon2';

/**
 * 密码安全工具类
 */
class PasswordUtils {
  /**
   * 哈希密码
   * @param password 明文密码
   * @returns 哈希后的密码
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      // 使用 argon2 哈希密码，包含盐值
      const hash = await argon2.hash(password, {
        type: argon2.argon2id, // 使用 Argon2id 算法
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3, // 3 次迭代
        parallelism: 1, // 并行度
        hashLength: 32 // 哈希长度
      });
      return hash;
    } catch (error) {
      throw new Error('密码哈希失败');
    }
  }

  /**
   * 验证密码
   * @param hash 哈希后的密码
   * @param password 明文密码
   * @returns 是否匹配
   */
  static async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      // 如果哈希格式错误或验证失败，返回 false
      return false;
    }
  }

  /**
   * 检查密码强度
   * @param password 密码
   * @returns 是否符合强度要求
   */
  static validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
    if (!password || password.length < 8) {
      return { isValid: false, message: '密码长度至少为8个字符' };
    }

    // if (!/(?=.*[a-z])/.test(password)) {
    //   return { isValid: false, message: '密码必须包含至少一个小写字母' };
    // }

    // if (!/(?=.*[A-Z])/.test(password)) {
    //   return { isValid: false, message: '密码必须包含至少一个大写字母' };
    // }

    // if (!/(?=.*\d)/.test(password)) {
    //   return { isValid: false, message: '密码必须包含至少一个数字' };
    // }

    // if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    //   return { isValid: false, message: '密码必须包含至少一个特殊字符' };
    // }

    return { isValid: true };
  }
}

export default PasswordUtils;
