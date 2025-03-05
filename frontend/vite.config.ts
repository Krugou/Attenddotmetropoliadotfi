import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

// Define the Vite configuration
//@ts-expect-error
export default defineConfig(({mode}) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      https: env.USE_SSL === 'true',
      host: true, // Expose to all network interfaces
    },
    plugins: [
      ...(env.USE_SSL === 'true' ? [basicSsl()] : []),
      // Use the React plugin with SWC
      react(),
      // Use the PWA plugin
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: {
          // Set the name of the PWA
          name: 'Attendance App',
          // Set the short name of the PWA
          short_name: 'Attend',
          // Set the theme color of the PWA
          theme_color: '#ffffff',
          icons: [
            {
              // Define a 192x192 icon for the PWA
              src: '/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              // Define a 512x512 icon for the PWA
              src: '/icons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
          id: 'attendance-app',
          start_url: '.',
          display: 'standalone',
        },
        workbox: {
          // Define Workbox options for generateSW
          // Set patterns to determine the files to be cached
          globPatterns: ['**/*.{js,css,html,png,jpg}'],
          // Skip waiting, meaning the service worker will take over the page as soon as it's activated
          skipWaiting: true,
          // Claim clients, meaning the service worker will take control of all pages under its scope immediately
          clientsClaim: true,
          // Clean up outdated caches
          cleanupOutdatedCaches: true,
          // Set the maximum file size to cache in bytes
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
        },
      }),
    ],

    build: {
      // Use esbuild for minification during the build process
      minify: 'esbuild',
    },
    esbuild: {
      // Remove console and debugger statements during the build process
      // drop: ['console', 'debugger'],
    },
  };
});
