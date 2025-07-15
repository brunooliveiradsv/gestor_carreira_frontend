// ficheiro: /api/musicas/busca-inteligente.js

// Importa as bibliotecas necessárias. A Vercel irá instalá-las automaticamente.
const axios = require('axios');
const cheerio = require('cheerio');

// Todas as funções serverless na Vercel exportam uma função principal
export default async function handler(req, res) {
    // Permite que a nossa app principal faça pedidos para esta API
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde a pedidos 'OPTIONS' (necessário para o CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Apenas permite pedidos POST
    if (req.method !== 'POST') {
        return res.status(405).json({ mensagem: 'Método não permitido.' });
    }

    const { nomeMusica, nomeArtista } = req.body;
    if (!nomeMusica || !nomeArtista) {
        return res.status(400).json({ mensagem: "Nome da música e do artista são necessários." });
    }

    const termoBusca = encodeURIComponent(`${nomeMusica} ${nomeArtista}`);
    const urlBusca = `https://www.cifraclub.com.br/search/?q=${termoBusca}`;

    try {
        const { data: dataBusca } = await axios.get(urlBusca);
        const $busca = cheerio.load(dataBusca);

        const primeiroResultado = $busca('#___gcse_0 .gsc-results-wrapper-visible .gsc-webResult .gsc-result a.gs-title').first().attr('href');
        
        if (!primeiroResultado) {
            return res.status(404).json({ mensagem: "Nenhuma cifra encontrada para esta música." });
        }
        
        // Agora, raspamos a página da cifra encontrada
        const { data: dataCifra } = await axios.get(primeiroResultado);
        const $cifra = cheerio.load(dataCifra);
        
        let nome = $cifra('.g-1 > h1.g-4').text().trim() || $cifra('h1.t1').text().trim();
        let artista = $cifra('.g-1 > h2.g-4 > a').text().trim() || $cifra('h2.t3').text().trim();
        const tom = $cifra('#cifra_tom').text().trim();
        const cifraHtml = $cifra('pre').html();

        if (!cifraHtml) {
             return res.status(404).json({ mensagem: "Não foi possível extrair a cifra da página encontrada." });
        }
        
        const cifraComQuebrasDeLinha = cifraHtml.replace(/<br\s*\/?>/gi, '\n');
        const $temp = cheerio.load(cifraComQuebrasDeLinha);
        const cifraLimpa = $temp.text();

        // Devolve o resultado completo
        return res.status(200).json({
            nome,
            artista,
            tom,
            notas_adicionais: cifraLimpa,
        });

    } catch (erro) {
        console.error("Erro na função serverless de busca:", erro);
        return res.status(500).json({ mensagem: "Erro ao realizar a busca inteligente." });
    }
}