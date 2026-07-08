export default function manifest() {
  return {
    name: "Na Pista — painel do motorista",
    short_name: "NaPista",
    description:
      "Controle de ganhos, gastos e consumo de combustível para motoristas de aplicativo.",
    start_url: "/",
    display: "standalone",
    background_color: "#14161B",
    theme_color: "#14161B",
    icons: [
      {
        src: "/icone.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
