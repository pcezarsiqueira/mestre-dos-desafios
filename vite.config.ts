
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'mestredosdesafios.com.br',
      'www.mestredosdesafios.com.br',
      'mestredosdesafios.paulinhosiqueira.com.br'
    ]
  }
});
