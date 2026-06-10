
export const getApiUrl = () => {
  return "";
};

export const fetchWithApiBase = (path: string, options?: RequestInit) => {
  const baseUrl = getApiUrl();
  return fetch(`${baseUrl}${path}`, options);
};
