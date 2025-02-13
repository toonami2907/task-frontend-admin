import api from "@/functions/resources/axiosConfig";

export class AuthService {
    constructor() {
      this.apiUrl = '/auth/v1';
    }
  
    async initiateGoogleSignIn() {
        const { data } = await api.post(`${this.apiUrl}/google`);
        return data.url;
      }
    
      async handleGoogleCallback(code) {
        const { data } = await api.get(`${this.apiUrl}/google/callback`, {
          params: { code }
        });
        return data;
      }
  }
  