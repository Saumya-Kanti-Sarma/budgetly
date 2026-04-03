export const success = <T>(data: T, message = 'OK', statusCode = 200) => ({
  success: true,
  statusCode,
  message,
  data,
});

export const failure = (message: string, statusCode = 400) => ({
  success: false,
  statusCode,
  message,
});
