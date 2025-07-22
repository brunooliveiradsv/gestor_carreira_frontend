// ficheiro: /api/musicas/busca-inteligente.js (VERSÃO FINAL E COMPLETA)

import axios from "axios";
import * as cheerio from "cheerio";

// --- FUNÇÕES AUXILIARES ---

/**
 * Obtém um token de acesso da API do Spotify.
 */
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "As credenciais do Spotify (SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET) não estão configuradas no ambiente."
    );
  }

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authString}`,
      },
    }
  );
  return response.data.access_token;
}

/**
 * Busca a música no Spotify, devolve os dados corrigidos e os dados técnicos.
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
    return null;
  }

  const track = response.data.tracks.items[0];
  const audioFeaturesResponse = await axios.get(
    `https://api.spotify.com/v1/audio-features/$${track.id}`,
    { headers: { Authorization: "Bearer " + token } }
  );

  console.log(
    `[Spotify] Dados encontrados para: ${track.name} - ${track.artists[0].name}`
  );

  // Converte a duração de milissegundos para o formato "mm:ss"
  const totalSegundos = Math.round(track.duration_ms / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  const duracaoFormatada = `${minutos}:${segundos.toString().padStart(2, "0")}`;

  return {
    nomeCorrigido: track.name,
    artistaCorrigido: track.artists[0].name,
    duracao_segundos: duracaoFormatada, // Devolve a duração já formatada
    bpm: audioFeaturesResponse.data.tempo
      ? Math.round(audioFeaturesResponse.data.tempo)
      : null,
  };
}

/**
 * Busca no Google pelo link do Cifra Club e extrai a cifra.
 */
async function buscarCifra(nomeMusica, nomeArtista) {
  const termoBusca = encodeURIComponent(
    `${nomeArtista} ${nomeMusica} cifraclub`
  );
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.SEARCH_ENGINE_ID;
  const urlBusca = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${termoBusca}`;

  const resultadoBuscaGoogle = await axios.get(urlBusca);

  if (
    !resultadoBuscaGoogle.data.items ||
    resultadoBuscaGoogle.data.items.length === 0
  )
    return null;

  const itemCifraClub = resultadoBuscaGoogle.data.items.find(
    (item) =>
      item.link &&
      item.link.includes("cifraclub.com.br") &&
      !item.link.includes("/videoaulas/")
  );

  if (itemCifraClub) {
    const linkCifra = itemCifraClub.link;
    console.log(`[Cifra Club] Link encontrado: ${linkCifra}`);

    const { data: dataCifra } = await axios.get(linkCifra, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $cifra = cheerio.load(dataCifra);
    const cifraHtml = $cifra("pre").html();

    if (cifraHtml) {
      const cifraComQuebrasDeLinha = cifraHtml.replace(/<br\s*\/?>/gi, "\n");
      const $temp = cheerio.load(cifraComQuebrasDeLinha);
      return {
        notas_adicionais: $temp.text(),
        tom: $cifra("#cifra_tom").text().trim() || "",
      };
    }
  }
  return null;
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

  let { nomeMusica, nomeArtista } = req.body;
  if (!nomeMusica || !nomeArtista) {
    return res
      .status(400)
      .json({ message: "Nome da música e do artista são necessários." });
  }

  try {
    console.log(
      `[Detetive Definitivo] Iniciando busca para: ${nomeMusica} - ${nomeArtista}`
    );

    const tokenSpotify = await getSpotifyToken();
    const dadosSpotify = await buscarDadosSpotify(
      nomeMusica,
      nomeArtista,
      tokenSpotify
    );

    // Se o Spotify encontrou algo, usamos os nomes corrigidos para a busca da cifra
    if (dadosSpotify) {
      nomeMusica = dadosSpotify.nomeCorrigido;
      nomeArtista = dadosSpotify.artistaCorrigido;
    }

    const dadosCifra = await buscarCifra(nomeMusica, nomeArtista);

    const dadosFinais = {
      nome: nomeMusica,
      artista: nomeArtista,
      tom: dadosCifra?.tom || "",
      notas_adicionais: dadosCifra?.notas_adicionais || "Cifra não encontrada.",
      bpm: dadosSpotify?.bpm || null,
      duracao_segundos: dadosSpotify?.duracao_segundos || null,
    };

    console.log(
      "[Detetive Definitivo] Sucesso! Devolvendo dados consolidados:",
      dadosFinais
    );
    return res.status(200).json(dadosFinais);
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("[Detetive Definitivo] ERRO CRÍTICO:", errorMessage);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno ao processar a sua busca." });
  }
}
