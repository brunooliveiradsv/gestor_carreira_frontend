// ficheiro: /api/musicas/busca-inteligente.js (VERSÃO FINAL COM SPOTIFY)

import axios from 'axios';
import * as cheerio from 'cheerio';

// --- FUNÇÕES AUXILIARES ---

async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("As credenciais do Spotify (SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET) não estão configuradas no ambiente.");
    }

    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${authString}`
        }
    });
    return response.data.access_token;
}

async function buscarDadosSpotify(nomeMusica, nomeArtista, token) {
    const termoBusca = encodeURIComponent(`track:${nomeMusica} artist:${nomeArtista}`);
    const url = `https://api.spotify.com/v1/search?q=${termoBusca}&type=track&limit=1`;
    const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });

    if (!response.data.tracks.items[0]) return {};
    const track = response.data.tracks.items[0];

    const audioFeaturesResponse = await axios.get(`https://api.spotify.com/v1/audio-features/${track.id}`, { headers: { 'Authorization': 'Bearer ' + token } });
    return {
        duracao_segundos: Math.round(track.duration_ms / 1000),
        bpm: audioFeaturesResponse.data.tempo ? Math.round(audioFeaturesResponse.data.tempo) : null,
    };
}

async function buscarCifra(resultadoBuscaGoogle) {
    if (!resultadoBuscaGoogle.data.items || resultadoBuscaGoogle.data.items.length === 0) return null;
    const itemCifraClub = resultadoBuscaGoogle.data.items.find(item => item.link && item.link.includes('cifraclub.com.br') && !item.link.includes('/videoaulas/'));

    if (itemCifraClub) {
        const { data: dataCifra } = await axios.get(itemCifraClub.link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
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
    if (!nomeMusica || !nomeArtista) return res.status(400).json({ message: "Nome da música e do artista são necessários." });

    try {
        const [tokenSpotify, resultadoBuscaGoogle] = await Promise.all([
            getSpotifyToken(),
            axios.get(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.SEARCH_ENGINE_ID}&q=${encodeURIComponent(nomeMusica + ' ' + nomeArtista + ' cifraclub')}`)
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
        console.error("[Detetive Definitivo] ERRO CRÍTICO:", errorMessage);
        return res.status(500).json({ message: "Ocorreu um erro interno ao processar a sua busca." });
    }
}