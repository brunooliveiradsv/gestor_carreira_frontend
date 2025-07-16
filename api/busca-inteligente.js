// ficheiro: /api/musicas/busca-inteligente.js (VERSÃO FINAL SEM SPOTIFY)

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Busca no Google pelo link do Cifra Club e extrai a cifra.
 */
async function buscarCifra(nomeMusica, nomeArtista) {
    const termoBusca = encodeURIComponent(`${nomeArtista} ${nomeMusica} cifraclub`);
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
        throw new Error("As chaves da API do Google não estão configuradas no ambiente.");
    }
    
    const urlBusca = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${termoBusca}`;
    
    const resultadoBuscaGoogle = await axios.get(urlBusca);

    if (!resultadoBuscaGoogle.data.items || resultadoBuscaGoogle.data.items.length === 0) {
        return null;
    }

    const itemCifraClub = resultadoBuscaGoogle.data.items.find(item => item.link && item.link.includes('cifraclub.com.br') && !item.link.includes('/videoaulas/'));

    if (itemCifraClub) {
        const linkCifra = itemCifraClub.link;
        console.log(`[Cifra Club] Link encontrado: ${linkCifra}`);
        
        const { data: dataCifra } = await axios.get(linkCifra, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $cifra = cheerio.load(dataCifra);
        
        const cifraHtml = $cifra('pre').html();
        if (cifraHtml) {
            const cifraComQuebrasDeLinha = cifraHtml.replace(/<br\s*\/?>/gi, '\n');
            const $temp = cheerio.load(cifraComQuebrasDeLinha);
            return {
                notas_adicionais: $temp.text(),
                tom: $cifra('#cifra_tom').text().trim() || ''
            };
        }
    }
    return null;
}

// --- FUNÇÃO PRINCIPAL (HANDLER) ---
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Apenas o método POST é permitido.' });

    const { nomeMusica, nomeArtista } = req.body;
    if (!nomeMusica || !nomeArtista) {
        return res.status(400).json({ message: "Nome da música e do artista são necessários." });
    }

    try {
        console.log(`[Detetive Cifra Club] Iniciando busca para: ${nomeMusica} - ${nomeArtista}`);
        
        const dadosCifra = await buscarCifra(nomeMusica, nomeArtista);
        
        const dadosFinais = {
            nome: nomeMusica,
            artista: nomeArtista,
            tom: dadosCifra?.tom || '',
            notas_adicionais: dadosCifra?.notas_adicionais || 'Cifra não encontrada. Por favor, tente uma busca mais específica.',
            // Campos de BPM e duração agora vêm vazios para preenchimento manual
            bpm: null,
            duracao_segundos: null,
        };
        
        console.log("[Detetive Cifra Club] Sucesso! Devolvendo dados consolidados.");
        return res.status(200).json(dadosFinais);

    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("[Detetive Cifra Club] ERRO CRÍTICO:", errorMessage);
        return res.status(500).json({ message: "Ocorreu um erro interno ao processar a sua busca." });
    }
}