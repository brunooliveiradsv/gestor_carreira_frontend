// ficheiro: /api/musicas/busca-inteligente.js

import axios from "axios";
import * as cheerio from "cheerio";

// --- FUNÇÃO DE AUTENTICAÇÃO ATUALIZADA ---
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // O Spotify espera as credenciais no corpo do pedido, não no cabeçalho para este fluxo
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

// ... (o resto do ficheiro permanece igual)

// Busca por uma música no Spotify e extrai os seus dados
async function buscarDadosSpotify(nomeMusica, nomeArtista, token) {
  const termoBusca = encodeURIComponent(
    `track:${nomeMusica} artist:${nomeArtista}`
  );
  const url = `https://api.spotify.com/v1/search?q=${termoBusca}&type=track&limit=1`;

  const response = await axios.get(url, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.data.tracks.items[0]) {
    console.log(
      `[Spotify] Não encontrou a música: ${nomeMusica} - ${nomeArtista}`
    );
    return {};
  }

  const track = response.data.tracks.items[0];
  const audioFeaturesResponse = await axios.get(
    `https://api.spotify.com/v1/audio-features/${track.id}`,
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ message: "Apenas o método POST é permitido." });

  const { nomeMusica, nomeArtista } = req.body;
  if (!nomeMusica || !nomeArtista) {
    return res
      .status(400)
      .json({ message: "Nome da música e do artista são necessários." });
  }

  try {
    console.log(
      `[Detetive Final V2] Iniciando busca completa para: ${nomeMusica} - ${nomeArtista}`
    );

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

    let dadosFinais = {
      nome: nomeMusica,
      artista: nomeArtista,
      tom: "",
      notas_adicionais: "Cifra não encontrada.",
      bpm: null,
      duracao_segundos: null,
    };

    const dadosSpotify = await buscarDadosSpotify(
      nomeMusica,
      nomeArtista,
      tokenSpotify
    );
    dadosFinais = { ...dadosFinais, ...dadosSpotify };

    if (
      resultadoBuscaGoogle.data.items &&
      resultadoBuscaGoogle.data.items.length > 0
    ) {
      const linkCifra = resultadoBuscaGoogle.data.items[0].link;
      if (linkCifra && linkCifra.includes("cifraclub.com.br")) {
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

    console.log("[Detetive Final V2] Sucesso! Devolvendo dados consolidados.");
    return res.status(200).json(dadosFinais);
  } catch (error) {
    console.error(
      "[Detetive Final V2] ERRO CRÍTICO:",
      error.response ? error.response.data : error.message
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno ao processar a sua busca." });
  }
}
