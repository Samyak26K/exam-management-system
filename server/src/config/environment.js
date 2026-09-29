const requiredEnvironmentVariables = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_SETUP_KEY'];

export function validateEnvironment() {
  const missingVariables = requiredEnvironmentVariables.filter((name) => !process.env[name]?.trim());
  if (missingVariables.length) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }
}