interface ApiResponse<T> {
  data?: T | undefined;
  success: boolean;
  message?: string | undefined;
}

export function formatResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
): ApiResponse<T> {
  return {
    success,
    data,
    message,
  };
}
