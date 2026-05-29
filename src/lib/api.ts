
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || "";
};

export const fetchWithApiBase = (path: string, options?: RequestInit) => {
  const baseUrl = getApiUrl();
  return fetch(`${baseUrl}${path}`, options);
};
