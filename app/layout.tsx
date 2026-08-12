import type { Metadata } from "next";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antenna Garden — tune what the weather kept",
  description:
    "An offline listening instrument where fictional transmissions grow into a botanical circuit diagram.",
  applicationName: "Antenna Garden",
  openGraph: {
    title: "Antenna Garden",
    description:
      "Tune fictional transmissions and grow them into a botanical circuit diagram.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Antenna Garden signal trace becoming six botanical circuit specimens on a weather chart",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Antenna Garden",
    description:
      "Tune fictional transmissions and grow them into a botanical circuit diagram.",
    images: ["/og.png"],
  },
};

const directionContract = `<!--
THESIS: Listening behavior is the drawing tool; the interface refuses both the neon retro-radio console and the frictionless white audio mixer.
OWN-WORLD: Damp weather-chart paper, plotted black ink, oxidized brass seams, verdigris and oxide specimens, with cobalt reserved for the impossible band.
STORY: Wake a lonely coastal receiver, steady fictional signals, plant their fragments, and discover the finished garden was an antenna diagram.
FIRST VIEWPORT: One brass seam divides a dominant tuning arc and live pressure trace from a broad rooted weather plot; the primary lever sits at the seam where signal becomes specimen.
FORM: Coastal weather-station recording drum, grounded direction 3, seed afcdc577; approved split-transformation comp.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <span
          className="direction-contract"
          aria-hidden="true"
          data-direction-seed="afcdc577"
          dangerouslySetInnerHTML={{ __html: directionContract }}
        />
        {children}
      </body>
    </html>
  );
}
