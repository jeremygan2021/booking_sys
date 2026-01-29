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
   * 发送预订通知短信
   * @param {Object} bookingDetails - 预订详情
   * @param {string} bookingDetails.name - 用户名字
   * @param {string} bookingDetails.unit_name - 预订信息
   * @param {string} bookingDetails.book_time - 预订时间
   * @param {string|number} bookingDetails.price - 价格
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async sendBookingNotification({ name, unit_name, book_time, price }) {
    try {
      const response = await axios.post(this.apiUrl, {
        phone_number: "18908854866", // 固定发送给管理员
        name: name,
        unit_name: unit_name,
        book_time: book_time,
        price: String(price),
        template_code: "SMS_501665123",
        sign_name: "叠加态科技云南",
        additionalProp1: {}
      }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success' && response.data.data.success) {
        console.log(`Booking notification sent to admin for ${name}`);
        return {
          success: true,
          message: '通知短信已发送'
        };
      } else {
        console.error('SMS API response:', response.data);
        // 这里仅仅记录错误，不抛出异常，避免影响主流程
        return {
          success: false,
          message: '短信发送失败'
        };
      }
    } catch (error) {
      console.error('Booking notification SMS error:', error);
      // 不抛出错误，以免影响预订流程
      return {
        success: false,
        message: '通知短信发送失败'
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
