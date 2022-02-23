import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { colorBlind, displayDarkTheme } from "../lib/state";

export default function ThemeManager() {
  const isDarkTheme = useRecoilValue(displayDarkTheme);
  const isColorBlindTheme = useRecoilValue(colorBlind);
  useEffect(() => {
    document.body.classList.toggle("nightmode", isDarkTheme);
    document.body.classList.toggle("colorblind", isColorBlindTheme);
  }, [isDarkTheme, isColorBlindTheme]);
  return null;
}
