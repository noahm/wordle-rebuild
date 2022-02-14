import Head from "next/head";
import { RecoilRoot } from "recoil";
import Game from "../components/game";

export default function Home() {
  return (
    <RecoilRoot>
      <Head>
        <title>Wordle*</title>
      </Head>
      <Game />
    </RecoilRoot>
  );
}
