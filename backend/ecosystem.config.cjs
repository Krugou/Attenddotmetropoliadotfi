module.exports = {
  apps: [
    {
      name: 'FileServer', // Application name
      script: './nodejs/jaksecfileserver.js', // Script to be run
      watch: false, // Don't watch this app
      min_uptime: 10000, // Minimum time to keep the process alive
      ignore_watch: ['node_modules', 'logs', 'package-lock.json'], // Ignore watch on jaksec folder to avoid infinite loop
      watch_delay: 3000,
      cron_restart: '0 0 * * *', // Reboot at midnight
    },
    {
      name: 'WSDBServer', // Application name
      script: './nodejs/jaksecserver.js', // Script to be run
      watch: false, // Don't watch this app
      min_uptime: 10000, // Minimum time to keep the process alive
      ignore_watch: ['node_modules', 'logs', 'package-lock.json', 'jaksec'], // Ignore watch on jaksec folder to avoid infinite loop
      watch_delay: 3000, // Delay between restart
      cron_restart: '0 0 * * *', // Reboot at midnight
    },
  ],
};
