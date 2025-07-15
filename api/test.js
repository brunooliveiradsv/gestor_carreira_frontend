// ficheiro: /api/test.js

export default function handler(req, res) {
  // Configuração básica do CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Devolve uma mensagem de sucesso simples
  res.status(200).json({ message: "Olá Mundo! A API da Vercel está a funcionar." });
}