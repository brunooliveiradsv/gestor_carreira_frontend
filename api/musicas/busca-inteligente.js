// Função Serverless para Busca Inteligente de Músicas - v2
// ficheiro: /api/musicas/busca-inteligente.js
import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
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
    const { data: dataBusca } = await axios.get(urlBusca);
    const $busca = cheerio.load(dataBusca);
    let linkEncontrado = null;

    $busca(".gsc-webResult.gsc-result a.gs-title").each((i, el) => {
      const href = $(el).attr("href");
      if (
        href &&
        href.includes("cifraclub.com.br") &&
        !href.includes("/videoaulas/")
      ) {
        linkEncontrado = href;
        return false;
      }
    });

    if (!linkEncontrado) {
      return res
        .status(404)
        .json({
          message: "Nenhuma cifra encontrada para esta música no Cifra Club.",
        });
    }

    const { data: dataCifra } = await axios.get(linkEncontrado);
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

    return res
      .status(200)
      .json({ nome, artista, tom, notas_adicionais: cifraLimpa });
  } catch (error) {
    console.error("[Busca Inteligente] ERRO CRÍTICO:", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno ao processar a sua busca." });
  }
}
