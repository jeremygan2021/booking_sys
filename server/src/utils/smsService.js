import axios from 'axios';

/**
 * SMS Service for sending verification codes
 */
class SMSService {
  constructor() {
    this.apiUrl = 'https://data.tangledup-ai.com/api/send-sms';
    // 存储验证码（生产环境应使用 Redis）
    this.verificationCodes = new Map();
    // 验证码有效期（5分钟）
    this.codeExpiry = 5 * 60 * 1000;
  }

  /**
   * 生成6位随机验证码
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送验证码
   * @param {string} phoneNumber - 手机号码
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async sendVerificationCode(phoneNumber) {
    try {
      // 生成验证码
      const code = this.generateCode();
      
      // 调用短信API
      const response = await axios.post(this.apiUrl, {
        phone_number: phoneNumber,
        code: code
      }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success' && response.data.data.success) {
        // 存储验证码和过期时间
        this.verificationCodes.set(phoneNumber, {
          code,
          expiresAt: Date.now() + this.codeExpiry
        });

        console.log(`Verification code sent to ${phoneNumber}: ${code}`);
        
        return {
          success: true,
          message: '验证码已发送'
        };
      } else {
        throw new Error('短信发送失败');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '验证码发送失败，请稍后重试'
      };
    }
  }

  /**
   * 验证验证码
   * @param {string} phoneNumber - 手机号码
   * @param {string} code - 验证码
   * @returns {boolean}
   */
  verifyCode(phoneNumber, code) {
    const stored = this.verificationCodes.get(phoneNumber);
    
    if (!stored) {
      return false;
    }

    // 检查是否过期
    if (Date.now() > stored.expiresAt) {
      this.verificationCodes.delete(phoneNumber);
      return false;
    }

    // 验证码匹配
    if (stored.code === code) {
      // 验证成功后删除验证码
      this.verificationCodes.delete(phoneNumber);
      return true;
    }

    return false;
  }

  /**
   * 清理过期的验证码
   */
  cleanupExpiredCodes() {
    const now = Date.now();
    for (const [phoneNumber, data] of this.verificationCodes.entries()) {
      if (now > data.expiresAt) {
        this.verificationCodes.delete(phoneNumber);
      }
    }
  }
}

// 创建单例实例
const smsService = new SMSService();

// 每分钟清理一次过期验证码
setInterval(() => {
  smsService.cleanupExpiredCodes();
}, 60 * 1000);

export default smsService;
