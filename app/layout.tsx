// import Script from "next/script";
import "../styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script async src="//unpkg.com/react-scan/dist/auto.global.js" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
