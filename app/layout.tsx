// import Script from "next/script";
import { Monitoring } from "react-scan/monitoring/next";
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
        <Monitoring
          apiKey="sYi9dinI2IKVGvBnnApzIrk_heWthtFh" // Safe to expose publically
          url="https://monitoring.react-scan.com/api/v1/ingest"
          commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} // optional but recommended
          branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF} // optional but recommended
        />
        {children}
      </body>
    </html>
  );
}
