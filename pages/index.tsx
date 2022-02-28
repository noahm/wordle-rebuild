import Head from "next/head";
import { useEffect, useState } from "react";
import { RecoilRoot } from "recoil";
import Game from "../components/game";
import Modal from "../components/modal";
import Takeover from "../components/takeover";
import ToastRoot from "../components/toast";

export default function Home() {
  const [renderGame, setRenderGame] = useState(false);
  useEffect(() => {
    setRenderGame(true);
  }, []);
  return (
    <RecoilRoot>
      <Head>
        <title>Wordle* - A daily word game</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta
          name="description"
          content="Guess the hidden word in 6 tries. A new puzzle is available each day."
        />
      </Head>
      {renderGame && <Game />}
      <Takeover />
      <Modal />
      <ToastRoot />
    </RecoilRoot>
  );
}
