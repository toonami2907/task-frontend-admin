export class AccountManager {
    constructor(api, userInfo) {
      this.api = api;
      this.userInfo = userInfo;
    }
  
    async updateProfile(profileData) {
      const response = await this.api.put('/auth/v1/user/edit/profile', profileData);
      return response.data;
    }
  
    async addAdAccount(accountData) {
      const response = await this.api.post('/auth/v1/user/add/account', accountData);
      return response.data;
    }
  
    async removeAdAccount(accountId) {
      const response = await this.api.delete(`/auth/v1/user/remove/${accountId}`);
      return response.data;
    }
  
    async updatePassword(passwordData) {
      const response = await this.api.put('/auth/password', passwordData);
      return response.data;
    }
  
    async updateBilling(billingData) {
      const response = await this.api.put('/auth/billing', billingData);
      return response.data;
    }
  
    async sendVerificationEmail() {
      const response = await this.api.post('/auth/v1/verify/email');
      return response.data;
    }
  
    validateAdAccount(accountData) {
      if (!accountData.account_id || !accountData.id) {
        throw new Error('Account ID and name are required');
      }
      return true;
    }
  
    validateBillingInfo(billingData) {
      const { cardNumber, expiry, cvc } = billingData;
      
      if (!cardNumber || !expiry || !cvc) {
        throw new Error('All billing fields are required');
      }
  
      if (!this.luhnCheck(cardNumber.replace(/\s/g, ''))) {
        throw new Error('Invalid card number');
      }
  
      const [month, year] = expiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiryDate < new Date()) {
        throw new Error('Card has expired');
      }
  
      if (!/^\d{3,4}$/.test(cvc)) {
        throw new Error('Invalid CVV');
      }
  
      return true;
    }
  
    validatePassword(passwordData) {
      const { currentPassword, newPassword, confirmPassword } = passwordData;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('All password fields are required');
      }
  
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
  
      return true;
    }
  
    luhnCheck(cardNumber) {
      // Implementation of Luhn algorithm
      let sum = 0;
      let isEven = false;
      
      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    }
  }
  