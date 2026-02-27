export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

