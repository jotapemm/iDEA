/**
 * Quem é a iDEA no papel, e onde ela mora na internet.
 *
 * `site`: o endereço oficial, sem barra no fim. Os links para outras páginas
 * do site, como o aviso de privacidade, partem daqui, completos, para
 * funcionarem também no Artifact, que roda fora do domínio. Se vier um
 * domínio próprio, ele muda aqui, no index.html e no privacidade.html.
 *
 * `razaoSocial` e `cnpj`: vazios até a empresa abrir. Preenchidos, aparecem
 * no rodapé e no aviso de privacidade.
 */
export const EMPRESA = {
  site: "https://idea-dft.pages.dev",
  razaoSocial: "",
  cnpj: "",
};

/** O endereço do aviso de privacidade. */
export const PRIVACIDADE = `${EMPRESA.site}/privacidade`;
