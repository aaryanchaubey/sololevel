import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  // Vite 8.3 can leave this injected client constant unreplaced in dev mode.
  // Disable optional browser-console forwarding so the client always boots.
  define: { __SERVER_FORWARD_CONSOLE__: 'false' },
  plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['icon.svg'],manifest:{name:'Solo Leveling',short_name:'SoloLeveling',description:'Your personal real-world progression system',theme_color:'#101322',background_color:'#0b0e17',display:'standalone',start_url:'/',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]},workbox:{navigateFallback:'index.html'}})]
});
