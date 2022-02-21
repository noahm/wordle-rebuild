import { useCallback } from "react";
import { RecoilValue, useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import {
  currentStreak,
  gamesPlayed,
  maxStreak,
  winPercentage,
} from "../lib/state";
import { modalState } from "./modal";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
`;

const H1 = styled.h1`
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 10px;
`;

const Statistics = styled.div`
  display: flex;
`;

const StatContainer = styled.div`
  flex: 1;
`;

const StatDiv = styled.div`
  font-size: 36px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  letter-spacing: 0.05em;
  font-variant-numeric: proportional-nums;

  &.timer {
    font-variant-numeric: initial;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Distributions = styled.div`
  width: 80%;
`;

const NoData = styled.div`
  text-align: center;
`;

`
.graph-container {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  padding-bottom: 4px;
  font-size: 14px;
  line-height: 20px;
}

.graph-container .graph {
  width: 100%;
  height: 100%;
  padding-left: 4px;
}

.graph-container .graph .graph-bar {
  height: 100%;
  /* Assume no wins */
  width: 0%;
  position: relative;
  background-color: var(--color-absent);
  display: flex;
  justify-content: center;
}

.graph-container .graph .graph-bar.highlight {
  background-color: var(--color-correct);
}

.graph-container .graph .graph-bar.align-right {
  justify-content: flex-end;
  padding-right: 8px;
}

.graph-container .graph .num-guesses {
  font-weight: bold;
  color: var(--tile-text-color);
}

#statistics,
#guess-distribution {
  padding-bottom: 10px;
}

.footer {
  display: flex;
  width: 100%;
}

.countdown {
  border-right: 1px solid var(--color-tone-1);
  padding-right: 12px;
  width: 50%;
}

.share {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 12px;
  width: 50%;
}

.no-data {
  text-align: center;
}

button#share-button {
  background-color: var(--key-bg-correct);
  color: var(--key-evaluated-text-color);
  font-family: inherit;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  -webkit-tap-highlight-color: rgba(0,0,0,0.3);
  width: 80%;
  font-size: 20px;
  height: 52px;
  -webkit-filter: brightness(100%);
}
button#share-button:hover {
  opacity: 0.9;
}
button#share-button game-icon {
  width: 24px;
  height: 24px;
  padding-left: 8px;
}
`;

function Stat({
  source,
  label,
}: {
  source: RecoilValue<number>;
  label: string;
}) {
  const n = useRecoilValue(source);
  return (
    <StatContainer>
      <StatDiv>{n}</StatDiv>
      <StatLabel>{label}</StatLabel>
    </StatContainer>
  );
}

export default function useShowStats() {
  const setModal = useSetRecoilState(modalState);
  return useCallback(() => {
    setModal([Stats]);
  }, [setModal]);
}

function Stats() {
  return (
    <Container>
      <H1>Statistics</H1>
      <Statistics>
        <Stat source={gamesPlayed} label="Played" />
        <Stat source={winPercentage} label="Won %" />
        <Stat source={currentStreak} label="Current Streak" />
        <Stat source={maxStreak} label="Max Streak" />
      </Statistics>
      <H1>Guess Distribution</H1>
      <Distributions>
        <NoData>No Data</NoData>
      </Distributions>
    </Container>
  );
}
