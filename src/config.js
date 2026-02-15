// Remove trailing slash if present
const normalizeUrl = (url) => url?.replace(/\/$/, '') || '';

const config = {
  API_URL: normalizeUrl(process.env.REACT_APP_API_URL) || 'http://localhost:5000',
  SOCKET_URL: normalizeUrl(process.env.REACT_APP_SOCKET_URL) || 'http://localhost:5000'
};

export default config;
