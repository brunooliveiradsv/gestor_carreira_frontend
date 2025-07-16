// ficheiro: /api/musicas/busca-inteligente.js (VERSÃO FINAL)

import axios from 'axios';
import * as cheerio from 'cheerio';

// --- FUNÇÕES AUXILIARES ---

async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("As credenciais do Spotify não estão configuradas.");
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    
    return response.data.access_token;
}

async function buscarDadosSpotify(nomeMusica, nomeArtista, token) {
    // Busca menos restrita, apenas pelo nome da música e do artista
    const termoBusca = encodeURIComponent(`${nomeMusica} ${nomeArtista}`);
    const url = `https://api.spotify.com/v1/search?q=${termoBusca}&type=track&limit=5`;
    
    const response = await axios.get(url, {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.data.tracks.items || response.data.tracks.items.length === 0) {
        console.log(`[Spotify] Não encontrou nenhuma música para: ${nomeMusica} - ${nomeArtista}`);
        return {};
    }

    // Lógica para encontrar o melhor resultado (o mais popular)
    const track = response.data.tracks.items.sort((a, b) => b.popularity - a.popularity)[0];
    console.log(`[Spotify] Melhor correspondência encontrada: ${track.name} com popularidade ${track.popularity}`);
    
    const audioFeaturesResponse = await axios.get(`https://api.spotify.com/v1/audio-features/${track.id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    
    return {
        duracao_segundos: Math.round(track.duration_ms / 1000),
        bpm: audioFeaturesResponse.data.tempo ? Math.round(audioFeaturesResponse.data.tempo) : null,
    };
}

async function buscarCifra(resultadoBuscaGoogle) {
     if (!resultadoBuscaGoogle.data.items || resultadoBuscaGoogle.data.items.length === 0) {
        return null;
    }

    // Procura nos 5 primeiros resultados do Google por um link válido do Cifra Club
    const itemCifraClub = resultadoBuscaGoogle.data.items.slice(0, 5).find(item => 
        item.link && item.link.includes('cifraclub.com.br') && !item.link.includes('/videoaulas/')
    );

    if (itemCifraClub) {
        const linkCifra = itemCifraClub.link;
        console.log(`[Cifra Club] Link encontrado: ${linkCifra}`);
        
        const { data: dataCifra } = await axios.get(linkCifra, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

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
    console.log("[Cifra Club] Nenhum link válido encontrado nos resultados do Google.");
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
        console.log(`[Detetive Especialista] Iniciando busca para: ${nomeMusica} - ${nomeArtista}`);
        
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
        
        console.log("[Detetive Especialista] Sucesso! Devolvendo dados consolidados.");
        return res.status(200).json(dadosFinais);

    } catch (error) {
        console.error("[Detetive Especialista] ERRO CRÍTICO:", error.response ? JSON.stringify(error.response.data) : error.message);
        return res.status(500).json({ message: "Ocorreu um erro interno ao processar a sua busca." });
    }
}