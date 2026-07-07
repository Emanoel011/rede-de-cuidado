import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/rede-de-cuidado/', // Deve ser exatamente o nome do seu repositório no GitHub
})
