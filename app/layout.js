import "./globals.css";

export const metadata = {
  title: "San Nicolas - Gestion Agencia",
  description: "Panel de gestion para cobros, tickets y caja de Agencia Samagata",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
