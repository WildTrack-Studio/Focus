module.exports = {
  apps: [
    {
      name: 'focus-backend',
      cwd: './backend',
      script: './node_modules/.bin/nest',
      args: 'start --watch',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      max_memory_restart: '500M',
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'focus-frontend',
      cwd: './frontend',
      script: './node_modules/.bin/next',
      args: 'dev -p 8080',
      env: {
        NODE_ENV: 'development',
        PORT: 8080,
        NODE_OPTIONS: '--max-old-space-size=2048', // Limite à 2GB de RAM
      },
      max_memory_restart: '2G',
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
