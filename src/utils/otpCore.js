const Axios = require('axios');

const api = Axios.create({
  baseURL: process.env.UNIFONIC_URL,
});
const AUTH_TOKEN = process.env.UNIFONIC_AUTH;

api.interceptors.response.use(
  async (response) => {
    if (response.data.status === 201 || response.data.status === 200) {
      return response.data;
    }
    if (response.data.status === 401) {
      // Need to complete the authorization
    } else {
      return Promise.reject(response.data);
    }
  },
  async (error) => Promise.reject(error.response),
);

const setAuthHeader = async () => {
  api.defaults.headers = {
    Accept: 'application/json',
    Authorization: AUTH_TOKEN,
  };
};

setAuthHeader();

module.exports = api;
