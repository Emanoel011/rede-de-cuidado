import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // SUBSTUIA 'nome-do-seu-repositorio' pelo nome exato do projeto no GitHub
  base: '/rede-de-cuidado/', 
})
