// ficheiro: /api/musicas/busca-inteligente.js (VERSÃO FINAL COM USER-AGENT NO TUNEBAT)

import axios from 'axios';
import * as cheerio from 'cheerio';

// --- FUNÇÕES AUXILIARES ---

/**
 * Busca no TuneBat e extrai dados técnicos (BPM, Duração, Tom).
 */
async function buscarDadosTuneBat(nomeMusica, nomeArtista) {
    try {
        const termoBusca = encodeURIComponent(`${nomeArtista} ${nomeMusica}`);
        const urlBusca = `https://tunebat.com/Search?q=${termoBusca}`;
        console.log(`[TuneBat] Buscando em: ${urlBusca}`);

        // --- INÍCIO DA CORREÇÃO ---
        // Adiciona um cabeçalho de User-Agent para simular um navegador
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        };
        // --- FIM DA CORREÇÃO ---

        const { data: dataBusca } = await axios.get(urlBusca, { headers });

        const $busca = cheerio.load(dataBusca);
        const linkPaginaMusica = $busca('.main-well a.search-track-name').first().attr('href');

        if (!linkPaginaMusica) {
            console.log("[TuneBat] Não encontrou um link para a página da música.");
            return {};
        }

        const urlCompletaMusica = `https://tunebat.com${linkPaginaMusica}`;
        console.log(`[TuneBat] Página da música encontrada: ${urlCompletaMusica}`);

        // Usa os mesmos headers para o segundo pedido
        const { data: dataPaginaMusica } = await axios.get(urlCompletaMusica, { headers });

        const $pagina = cheerio.load(dataPaginaMusica);
        const dadosTecnicos = {};

        $pagina('.info-box-value').each(function() {
            const valor = $(this).text().trim();
            const tipo = $(this).prev('.info-box-key').text().trim();

            if (tipo.includes('Key')) dadosTecnicos.tom = valor;
            if (tipo.includes('BPM')) dadosTecnicos.bpm = parseInt(valor, 10);
            if (tipo.includes('Duration')) {
                const partes = valor.split(':');
                if (partes.length === 2) {
                    dadosTecnicos.duracao_segundos = parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
                }
            }
        });
        
        console.log("[TuneBat] Dados técnicos extraídos:", dadosTecnicos);
        return dadosTecnicos;

    } catch (error) {
        console.error("[TuneBat] Erro ao buscar dados:", error.message);
        return {}; 
    }
}

/**
 * Busca no Google pelo link do Cifra Club e extrai a cifra.
 */
async function buscarCifra(resultadoBuscaGoogle) {
    if (!resultadoBuscaGoogle.data.items || resultadoBuscaGoogle.data.items.length === 0) {
        return null;
    }
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
        console.log(`[Detetive TuneBat] Iniciando busca para: ${nomeMusica} - ${nomeArtista}`);
        
        const [dadosTecnicos, resultadoBuscaGoogle] = await Promise.all([
            buscarDadosTuneBat(nomeMusica, nomeArtista),
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
        
        console.log("[Detetive TuneBat] Sucesso! Devolvendo dados consolidados.");
        return res.status(200).json(dadosFinais);

    } catch (error) {
        console.error("[Detetive TuneBat] ERRO CRÍTICO:", error.response ? JSON.stringify(error.response.data) : error.message);
        return res.status(500).json({ message: "Ocorreu um erro interno ao processar a sua busca." });
    }
}