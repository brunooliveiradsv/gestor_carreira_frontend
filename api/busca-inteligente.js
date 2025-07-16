// ficheiro: /api/musicas/busca-inteligente.js (VERSÃO FINAL COM AUTENTICAÇÃO ALTERNATIVA)

import axios from 'axios';
import * as cheerio from 'cheerio';

// --- FUNÇÃO DE AUTENTICAÇÃO COM O MÉTODO DE CABEÇALHO (HEADER) ---
async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("As credenciais do Spotify não foram encontradas no ambiente.");
    }
    
    // Codifica o Client ID e o Client Secret em Base64
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // Usa a string codificada no cabeçalho de Autorização
            'Authorization': `Basic ${authString}`
        }
    });
    
    return response.data.access_token;
}

// O resto do ficheiro permanece exatamente igual
async function buscarDadosSpotify(nomeMusica, nomeArtista, token) {
    const termoBusca = encodeURIComponent(`track:${nomeMusica} artist:${nomeArtista}`);
    const url = `https://api.spotify.com/v1/search?q=${termoBusca}&type=track&limit=1`;
    const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });
    if (!response.data.tracks.items[0]) {
        console.log(`[Spotify] Não encontrou a música: ${nomeMusica} - ${nomeArtista}`);
        return {};
    }
    const track = response.data.tracks.items[0];
    const audioFeaturesResponse = await axios.get(`https://api.spotify.com/v1/audio-features/${track.id}`, { headers: { 'Authorization': 'Bearer ' + token } });
    return {
        duracao_segundos: Math.round(track.duration_ms / 1000),
        bpm: audioFeaturesResponse.data.tempo ? Math.round(audioFeaturesResponse.data.tempo) : null,
    };
}

async function buscarCifra(resultadoBuscaGoogle) {
     if (!resultadoBuscaGoogle.data.items || resultadoBuscaGoogle.data.items.length === 0) return null;
    const itemCifraClub = resultadoBuscaGoogle.data.items.slice(0, 5).find(item => item.link && item.link.includes('cifraclub.com.br') && !item.link.includes('/videoaulas/'));
    if (itemCifraClub) {
        const { data: dataCifra } = await axios.get(itemCifraClub.link, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' } });
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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Apenas o método POST é permitido.' });

    const { nomeMusica, nomeArtista } = req.body;
    if (!nomeMusica || !nomeArtista) return res.status(400).json({ message: "Nome da música e do artista são necessários." });

    try {
        const [tokenSpotify, resultadoBuscaGoogle] = await Promise.all([
            getSpotifyToken(),
            axios.get(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.SEARCH_ENGINE_ID}&q=${encodeURIComponent(nomeMusica + ' ' + nomeArtista)}`)
        ]);

        const [dadosSpotify, dadosCifra] = await Promise.all([
            buscarDadosSpotify(nomeMusica, nomeArtista, tokenSpotify),
            buscarCifra(resultadoBuscaGoogle)
        ]);
        
        const dadosFinais = {
            nome: nomeMusica,
            artista: nomeArtista,
            tom: dadosCifra?.tom || '',
            notas_adicionais: dadosCifra?.notas_adicionais || 'Cifra não encontrada.',
            bpm: dadosSpotify?.bpm || null,
            duracao_segundos: dadosSpotify?.duracao_segundos || null,
        };
        
        return res.status(200).json(dadosFinais);
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("[Diagnóstico Final] ERRO CRÍTICO:", errorMessage);
        return res.status(500).json({ message: "Ocorreu um erro interno ao processar a sua busca." });
    }
}