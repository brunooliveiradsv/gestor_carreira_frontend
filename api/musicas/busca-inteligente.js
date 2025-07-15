// ficheiro: /api/musicas/busca-inteligente.js

import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  // Configuração do CORS
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
    const termoBusca = encodeURIComponent(`${nomeMusica} ${nomeArtista}`);
    const urlBusca = `https://www.cifraclub.com.br/search/?q=${termoBusca}`;

    // --- INÍCIO DA CORREÇÃO ---
    // Adiciona um cabeçalho de User-Agent para simular um navegador real
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    };

    console.log(`[Busca Final] Buscando em: ${urlBusca}`);
    const { data: dataBusca } = await axios.get(urlBusca, { headers });
    // --- FIM DA CORREÇÃO ---

    const $busca = cheerio.load(dataBusca);
    let linkEncontrado = null;

    $busca("a.gs-title").each((i, el) => {
      const href = $(el).attr("href");
      const artistaFormatado = nomeArtista.toLowerCase().replace(/\s+/g, "-");
      if (
        href &&
        href.includes(artistaFormatado) &&
        !href.includes("/videoaulas/")
      ) {
        linkEncontrado = href;
        return false;
      }
    });

    if (!linkEncontrado) {
      linkEncontrado = $busca("a.gs-title").first().attr("href");
    }

    if (!linkEncontrado) {
      return res
        .status(404)
        .json({ message: "Nenhuma cifra encontrada para esta música." });
    }

    console.log(`[Busca Final] Link encontrado: ${linkEncontrado}`);

    // Também usamos os headers para o segundo pedido
    const { data: dataCifra } = await axios.get(linkEncontrado, { headers });
    const $cifra = cheerio.load(dataCifra);

    const nome =
      $cifra(".g-1 > h1.g-4").text().trim() || $cifra("h1.t1").text().trim();
    const artista =
      $cifra(".g-1 > h2.g-4 > a").text().trim() ||
      $cifra("h2.t3").text().trim();
    const tom = $cifra("#cifra_tom").text().trim();
    const cifraHtml = $cifra("pre").html();

    if (!cifraHtml) {
      return res
        .status(404)
        .json({
          message: "Não foi possível extrair a cifra da página encontrada.",
        });
    }

    const cifraComQuebrasDeLinha = cifraHtml.replace(/<br\s*\/?>/gi, "\n");
    const $temp = cheerio.load(cifraComQuebrasDeLinha);
    const cifraLimpa = $temp.text();

    console.log("[Busca Final] Sucesso! Devolvendo dados.");
    return res
      .status(200)
      .json({ nome, artista, tom, notas_adicionais: cifraLimpa });
  } catch (error) {
    console.error("[Busca Final] ERRO CRÍTICO:", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno ao processar a sua busca." });
  }
}
