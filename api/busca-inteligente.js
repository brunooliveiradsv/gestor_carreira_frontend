// ficheiro: /api/busca-inteligente.js

import axios from 'axios';
import * as cheerio from 'cheerio';

// --- MÓDULO DE RASPAGEM PARA O CIFRA CLUB ---
async function rasparCifraClub(url) {
    try {
        console.log('[Detetive] A ler Cifra Club:', url);
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        
        const nome = $('.g-1 > h1.g-4').text().trim() || $('h1.t1').text().trim();
        const artista = $('.g-1 > h2.g-4 > a').text().trim() || $('h2.t3').text().trim();
        const tom = $('#cifra_tom').text().trim();
        const cifraHtml = $('pre').html();

        if (!cifraHtml) return null;

        const cifraComQuebrasDeLinha = cifraHtml.replace(/<br\s*\/?>/gi, '\n');
        const $temp = cheerio.load(cifraComQuebrasDeLinha);
        const cifraLimpa = $temp.text();
        
        return { nome, artista, tom, notas_adicionais: cifraLimpa };
    } catch (error) {
        console.error("Erro ao raspar Cifra Club:", error.message);
        return null;
    }
}

// --- MÓDULO DE RASPAGEM PARA O LETRAS.MUS.BR ---
async function rasparLetrasMus(url) {
    try {
        console.log('[Detetive] A ler Letras.mus.br:', url);
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        
        const nome = $('.cnt-head_title h1').text().trim();
        const artista = $('.cnt-head_title h2 a').text().trim();
        
        // Letras.mus.br não tem cifras, então extraímos a letra
        $('.cnt-letra .letra-frase').find('br').replaceWith('\n');
        const letra = $('.cnt-letra').text().trim();

        return { nome, artista, notas_adicionais: letra };
    } catch (error) {
        console.error("Erro ao raspar Letras.mus.br:", error.message);
        return null;
    }
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
        const termoBusca = `${nomeMusica} ${nomeArtista}`;
        const apiKey = process.env.GOOGLE_API_KEY;
        const searchEngineId = process.env.SEARCH_ENGINE_ID;
        
        const urlBusca = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(termoBusca)}`;
        
        console.log(`[Detetive] Buscando no Google por: ${termoBusca}`);
        const { data: dataBusca } = await axios.get(urlBusca);

        if (!dataBusca.items || dataBusca.items.length === 0) {
            return res.status(404).json({ message: "Nenhum resultado encontrado no Google." });
        }

        let dadosFinais = {
            nome: nomeMusica,
            artista: nomeArtista,
            tom: '',
            notas_adicionais: 'Nenhuma informação encontrada.'
        };

        // Itera sobre os resultados do Google para encontrar a melhor fonte
        for (const item of dataBusca.items) {
            const link = item.link;
            
            if (link.includes('cifraclub.com.br')) {
                const dados = await rasparCifraClub(link);
                if (dados && dados.notas_adicionais) {
                    dadosFinais = { ...dadosFinais, ...dados };
                    break; // Encontrou a cifra, pode parar
                }
            } else if (link.includes('letras.mus.br') && dadosFinais.notas_adicionais === 'Nenhuma informação encontrada.') {
                // Só usa o Letras.mus.br se ainda não tiver encontrado uma cifra
                const dados = await rasparLetrasMus(link);
                if (dados) {
                    dadosFinais = { ...dadosFinais, ...dados };
                }
            }
        }
        
        return res.status(200).json(dadosFinais);

    } catch (error) {
        console.error("[Detetive] ERRO CRÍTICO:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: "Ocorreu um erro interno ao processar a sua busca." });
    }
}