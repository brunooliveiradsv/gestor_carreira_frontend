// ficheiro: /api/musicas/busca-inteligente.js (VERSÃO FINAL COM GETSONGKEY.COM)

import axios from 'axios';
import * as cheerio from 'cheerio';

// --- FUNÇÕES AUXILIARES ---

/**
 * Busca no getsongkey.com e extrai dados técnicos (BPM, Tom, Duração).
 */
async function buscarDadosTecnicos(nomeMusica, nomeArtista) {
    try {
        const termoBusca = encodeURIComponent(`${nomeArtista} ${nomeMusica}`);
        const urlBusca = `https://getsongkey.com/search?q=${termoBusca}`;
        console.log(`[GetSongKey] Buscando em: ${urlBusca}`);

        const { data: dataBusca } = await axios.get(urlBusca, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

        const $busca = cheerio.load(dataBusca);
        // Encontra o link da primeira música na lista de resultados
        const linkPaginaMusica = $busca('a.gsk-link').first().attr('href');

        if (!linkPaginaMusica) {
            console.log("[GetSongKey] Não encontrou um link para a página da música.");
            return {};
        }

        console.log(`[GetSongKey] Página da música encontrada: ${linkPaginaMusica}`);
        const { data: dataPaginaMusica } = await axios.get(linkPaginaMusica, {
             headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

        const $pagina = cheerio.load(dataPaginaMusica);
        const dadosTecnicos = {};

        // Extrai os dados específicos da página da música
        dadosTecnicos.tom = $pagina('p:contains("Key:") span').text().trim();
        dadosTecnicos.bpm = parseInt($pagina('p:contains("BPM:") span').text().trim(), 10);
        
        const duracaoTexto = $pagina('p:contains("Duration:") span').text().trim();
        const partes = duracaoTexto.split(':');
        if (partes.length === 2) {
            dadosTecnicos.duracao_segundos = parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
        }
        
        console.log("[GetSongKey] Dados técnicos extraídos:", dadosTecnicos);
        return dadosTecnicos;

    } catch (error) {
        console.error("[GetSongKey] Erro ao buscar dados:", error.message);
        return {}; // Retorna um objeto vazio em caso de erro
    }
}

/**
 * Busca no Google pelo link do Cifra Club e extrai a cifra.
 */
async function buscarCifra(resultadoBuscaGoogle) {
    if (!resultadoBuscaGoogle.data.items || resultadoBuscaGoogle.data.items.length === 0) return null;
    const itemCifraClub = resultadoBuscaGoogle.data.items.slice(0, 5).find(item => item.link && item.link.includes('cifraclub.com.br') && !item.link.includes('/videoaulas/'));

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
        console.log(`[Detetive GetSongKey] Iniciando busca para: ${nomeMusica} - ${nomeArtista}`);
        
        const [dadosTecnicos, resultadoBuscaGoogle] = await Promise.all([
            buscarDadosTecnicos(nomeMusica, nomeArtista),
            axios.get(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.SEARCH_ENGINE_ID}&q=${encodeURIComponent(nomeMusica + ' ' + nomeArtista + ' cifraclub')}`)
        ]);

        const dadosCifra = await buscarCifra(resultadoBuscaGoogle);
        
        const dadosFinais = {
            nome: nomeMusica,
            artista: nomeArtista,
            tom: dadosCifra?.tom || dadosTecnicos?.tom || '',
            notas_adicionais: dadosCifra?.notas_adicionais || 'Cifra não encontrada.',
            bpm: dadosTecnicos?.bpm || null,
            duracao_segundos: dadosTecnicos?.duracao_segundos || null,
        };
        
        console.log("[Detetive GetSongKey] Sucesso! Devolvendo dados consolidados:", dadosFinais);
        return res.status(200).json(dadosFinais);

    } catch (error) {
        console.error("[Detetive GetSongKey] ERRO CRÍTICO:", error.response ? JSON.stringify(error.response.data) : error.message);
        return res.status(500).json({ message: "Ocorreu um erro interno ao processar a sua busca." });
    }
}