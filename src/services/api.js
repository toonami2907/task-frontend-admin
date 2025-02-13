import api from '@/functions/resources/axiosConfig';



export const apiService = {
  async getRules() {
    const { data } = await api.get('/api/rules');
    return data;
  },

  async getMetrics() {
    const { data } = await api.get('/api/metrics');
    return data;
  },
  async ruleStatus(ruleId, status){
    console.log(status)
    const {data} = await api.put(`/api/rules/${ruleId}/status`, {status})
    return data
  },

  async createRule(rule) {
    const { data } = await api.post('/api/rules', rule);
    return data;
  },

  async updateRule(id, rule) {
    const { data } = await api.put(`/api/rules/${id}`, rule);
    return data;
  },

  async deleteRule(id) {
    await api.delete(`/api/rules/${id}`);
  }
};
