import Head from "next/head";
import { useEffect, useState } from "react";
import { RecoilRoot } from "recoil";
import Game from "../components/game";
import Takeover from "../components/takeover";

export default function Home() {
  const [renderGame, setRenderGame] = useState(false);
  useEffect(() => {
    setRenderGame(true);
  }, []);
  return (
    <RecoilRoot>
      <Head>
        <title>Wordle*</title>
      </Head>
      {renderGame && <Game />}
      <Takeover />
    </RecoilRoot>
  );
}
