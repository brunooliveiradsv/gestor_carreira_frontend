// ficheiro: /api/musicas/busca-inteligente.js (VERSÃO COMPLETA E FINAL)

import axios from "axios";
import * as cheerio from "cheerio";

// --- FUNÇÕES AUXILIARES ---

/**
 * Obtém um token de acesso da API do Spotify usando as credenciais do ambiente.
 */
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "As credenciais do Spotify (SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET) não estão configuradas no ambiente."
    );
  }

  // O Spotify espera as credenciais no corpo do pedido para este fluxo.
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

/**
 * Busca por uma música no Spotify e extrai os seus dados técnicos (BPM, duração).
 */
async function buscarDadosSpotify(nomeMusica, nomeArtista, token) {
  const termoBusca = encodeURIComponent(
    `track:${nomeMusica} artist:${nomeArtista}`
  );
  const url = `https://api.spotify.com/v1/search?q=$${termoBusca}&type=track&limit=1`;

  const response = await axios.get(url, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.data.tracks.items[0]) {
    console.log(
      `[Spotify] Não encontrou a música: ${nomeMusica} - ${nomeArtista}`
    );
    return {}; // Não encontrou a música, retorna objeto vazio
  }

  const track = response.data.tracks.items[0];
  const audioFeaturesResponse = await axios.get(
    `https://api.spotify.com/v1/audio-features/$${track.id}`,
    {
      headers: { Authorization: "Bearer " + token },
    }
  );

  console.log(`[Spotify] Dados técnicos encontrados para: ${track.name}`);
  return {
    duracao_segundos: Math.round(track.duration_ms / 1000),
    bpm: audioFeaturesResponse.data.tempo
      ? Math.round(audioFeaturesResponse.data.tempo)
      : null,
  };
}

// --- FUNÇÃO PRINCIPAL (HANDLER) ---
export default async function handler(req, res) {
  // Configuração do CORS para permitir pedidos do teu frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Apenas o método POST é permitido." });
  }

  const { nomeMusica, nomeArtista } = req.body;
  if (!nomeMusica || !nomeArtista) {
    return res
      .status(400)
      .json({ message: "Nome da música e do artista são necessários." });
  }

  try {
    console.log(
      `[Detetive Final] Iniciando busca completa para: ${nomeMusica} - ${nomeArtista}`
    );

    // Etapa 1: Obter o token do Spotify e fazer a busca no Google em paralelo para ganhar tempo
    const [tokenSpotify, resultadoBuscaGoogle] = await Promise.all([
      getSpotifyToken(),
      axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${
          process.env.GOOGLE_API_KEY
        }&cx=${process.env.SEARCH_ENGINE_ID}&q=${encodeURIComponent(
          nomeMusica + " " + nomeArtista
        )}`
      ),
    ]);

    // Prepara o objeto de resposta final com os dados que já temos
    let dadosFinais = {
      nome: nomeMusica,
      artista: nomeArtista,
      tom: "",
      notas_adicionais: "Cifra não encontrada.",
      bpm: null,
      duracao_segundos: null,
    };

    // Etapa 2: Buscar os dados técnicos no Spotify usando o token obtido
    const dadosSpotify = await buscarDadosSpotify(
      nomeMusica,
      nomeArtista,
      tokenSpotify
    );
    dadosFinais = { ...dadosFinais, ...dadosSpotify };

    // Etapa 3: Processar o resultado do Google para encontrar e raspar a cifra
    if (
      resultadoBuscaGoogle.data.items &&
      resultadoBuscaGoogle.data.items.length > 0
    ) {
      const linkCifra = resultadoBuscaGoogle.data.items[0].link;

      // Apenas tenta raspar se o link for do Cifra Club
      if (linkCifra && linkCifra.includes("cifraclub.com.br")) {
        console.log(
          `[Detetive Final] Link do Cifra Club encontrado: ${linkCifra}`
        );
        const { data: dataCifra } = await axios.get(linkCifra);
        const $cifra = cheerio.load(dataCifra);

        const cifraHtml = $cifra("pre").html();
        if (cifraHtml) {
          const cifraComQuebrasDeLinha = cifraHtml.replace(
            /<br\s*\/?>/gi,
            "\n"
          );
          const $temp = cheerio.load(cifraComQuebrasDeLinha);
          dadosFinais.notas_adicionais = $temp.text();
          dadosFinais.tom =
            $cifra("#cifra_tom").text().trim() || dadosFinais.tom;
        }
      }
    }

    console.log("[Detetive Final] Sucesso! Devolvendo dados consolidados.");
    return res.status(200).json(dadosFinais);
  } catch (error) {
    // Registo de erro mais detalhado
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("[Detetive Final] ERRO CRÍTICO:", errorMessage);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno ao processar a sua busca." });
  }
}
