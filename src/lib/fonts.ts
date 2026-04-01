import { Archivo_Narrow, Archivo_Black, Anton_SC, Bebas_Neue, Barlow_Condensed } from "next/font/google";

export const archivo = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "700",],
});

export const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400", 
});

export const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400", // Bebas Neue usually only comes in one weight (Bold)
});

export const anton = Anton_SC({
  subsets: ["latin"],
  weight: "400", 
});

export const barlowBlack = Barlow_Condensed({
  subsets: ["latin"],
  weight: "900", // This is the heavy hitter you found!
});