/**
 * O navegador que fotografa e filma a marca: um Chrome ou Edge sem janela.
 * Quem usa: scripts/imagens.mjs (as fotos) e scripts/video.mjs (o vídeo).
 *
 * Se ele estiver num lugar diferente, diga onde:
 * NAVEGADOR="C:/caminho/chrome.exe" pnpm imagens
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function navegador() {
  const candidatos = [
    process.env.NAVEGADOR,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const achado = candidatos.find((c) => c && existsSync(c));
  if (!achado) {
    throw new Error('Não achei Chrome nem Edge. Diga onde ele está: NAVEGADOR="caminho" pnpm imagens');
  }
  return achado;
}

/**
 * Abre o navegador sem janela e conversa com ele pelo protocolo do DevTools,
 * o mesmo que o Puppeteer usa. A conversa passa por um cano (pipe), não por
 * uma porta de rede: cada mensagem é um JSON terminado por um byte zero. O
 * perfil é descartável, como nas fotos, e some no `fechar()`.
 */
export function conectar() {
  const perfil = mkdtempSync(join(tmpdir(), "idea-navegador-"));
  const proc = spawn(
    navegador(),
    [
      "--headless",
      // Sem placa de vídeo, o desenho sai igual em toda rodada. Com ela, um
      // ou outro pixel da letra grande variava de uma vez para outra.
      "--disable-gpu",
      "--remote-debugging-pipe",
      `--user-data-dir=${perfil}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--mute-audio",
      "about:blank",
    ],
    // O cano são as saídas 3 e 4: o navegador lê ordens na 3 e responde na 4.
    { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] },
  );

  const morreu = new Promise((_, falha) => {
    proc.on("error", falha);
    proc.on("exit", () => falha(new Error("O navegador fechou no meio do caminho.")));
  });
  morreu.catch(() => {}); // quem estiver esperando resposta recebe o erro

  let ultimo = 0;
  const pendentes = new Map();
  const esperas = [];

  function receber(msg) {
    if (msg.id) {
      const p = pendentes.get(msg.id);
      if (!p) return;
      pendentes.delete(msg.id);
      if (msg.error) p.falha(new Error(`${p.method}: ${msg.error.message}`));
      else p.ok(msg.result);
      return;
    }
    for (let i = esperas.length - 1; i >= 0; i--) {
      const e = esperas[i];
      if (e.method === msg.method && e.sessionId === msg.sessionId) {
        esperas.splice(i, 1);
        e.ok(msg.params);
      }
    }
  }

  // Uma mensagem pode chegar em vários pedaços, e um pedaço pode trazer
  // várias mensagens. Só o byte zero diz onde cada uma termina.
  let partes = [];
  proc.stdio[4].on("data", (pedaco) => {
    let inicio = 0;
    let fim;
    while ((fim = pedaco.indexOf(0, inicio)) >= 0) {
      partes.push(pedaco.subarray(inicio, fim));
      receber(JSON.parse(Buffer.concat(partes).toString("utf8")));
      partes = [];
      inicio = fim + 1;
    }
    if (inicio < pedaco.length) partes.push(pedaco.subarray(inicio));
  });

  function enviar(method, params = {}, sessionId) {
    const id = ++ultimo;
    const resposta = new Promise((ok, falha) => pendentes.set(id, { method, ok, falha }));
    proc.stdio[3].write(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }) + "\0");
    return Promise.race([resposta, morreu]);
  }

  function esperar(method, sessionId) {
    return Promise.race([new Promise((ok) => esperas.push({ method, sessionId, ok })), morreu]);
  }

  /**
   * Abre `url` numa aba de `larg`×`alt`, espera a página e as fontes
   * carregarem e devolve `cdp`, para mandar ordens à aba, e `avaliar`, que
   * roda um código na página e devolve o resultado.
   */
  async function abrir(url, larg, alt) {
    const { targetId } = await enviar("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await enviar("Target.attachToTarget", { targetId, flatten: true });
    const cdp = (method, params) => enviar(method, params, sessionId);
    const avaliar = async (expression) => {
      const r = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      }
      return r.result.value;
    };

    await cdp("Page.enable");
    await cdp("Emulation.setDeviceMetricsOverride", { width: larg, height: alt, deviceScaleFactor: 1, mobile: false });
    const carregou = esperar("Page.loadEventFired", sessionId);
    await cdp("Page.navigate", { url });
    await carregou;

    // As fontes vêm do Google. Sem elas, o texto sairia na fonte de reserva.
    const fontes = await avaliar(`(async () => {
      const titulo = await document.fonts.load('760 100px Archivo');
      const mono = await document.fonts.load('32px "JetBrains Mono"');
      await document.fonts.ready;
      return titulo.length > 0 && mono.length > 0;
    })()`);
    if (!fontes) throw new Error("As fontes do Google não chegaram. Está sem internet?");

    return { cdp, avaliar };
  }

  async function fechar() {
    await Promise.race([enviar("Browser.close").catch(() => {}), new Promise((r) => setTimeout(r, 3000))]);
    if (proc.exitCode === null && proc.signalCode === null) {
      proc.kill();
      await new Promise((r) => proc.once("exit", r));
    }
    rmSync(perfil, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }

  return { abrir, fechar };
}
