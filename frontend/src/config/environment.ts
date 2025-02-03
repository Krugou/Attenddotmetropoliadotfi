export const ENV = {
  development: import.meta.env.MODE === 'development',
  production: import.meta.env.MODE === 'production',
  test: import.meta.env.MODE === 'test',
} as const;
