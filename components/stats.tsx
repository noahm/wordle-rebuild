import { useCallback } from "react";
import { RecoilValue, useRecoilValue, useSetRecoilState } from "recoil";
import { useCountdown } from "rooks";
import styled from "styled-components";
import { useGameDispatch } from "../lib/actions";
import { nextWordle } from "../lib/logic";
import { gameStatus, winningGuessCount } from "../lib/state";
import {
  currentStreak,
  gamesPlayed,
  guesses,
  maxStreak,
  winPercentage,
} from "../lib/stats";
import { times } from "../lib/utils";
import Icon from "./icon";
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

const Statistics = styled.section`
  display: flex;
  padding-bottom: 10px;
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

const Distributions = styled.section`
  width: 80%;
  padding-bottom: 10px;
`;

const NoData = styled.div`
  text-align: center;
`;

const GraphContainer = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  padding-bottom: 4px;
  font-size: 14px;
  line-height: 20px;
`;

const Graph = styled.div`
  width: 100%;
  height: 100%;
  padding-left: 4px;
`;

const GraphBar = styled.div`
  height: 100%;
  /* Assume no wins */
  width: 0%;
  position: relative;
  background-color: var(--color-absent);
  display: flex;
  justify-content: center;
  &.highlight {
    background-color: var(--color-correct);
  }
  &.align-right {
    justify-content: flex-end;
    padding-right: 8px;
  }
`;

const NumGuesses = styled.div`
  font-weight: bold;
  color: var(--tile-text-color);
`;

const Footer = styled.div`
  display: flex;
  width: 100%;
`;

const Countdown = styled.div`
  border-right: 1px solid var(--color-tone-1);
  padding-right: 12px;
  width: 50%;
`;

const Share = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 12px;
  width: 50%;
`;

const ShareButton = styled.button`
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
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.3);
  width: 80%;
  font-size: 20px;
  height: 52px;
  -webkit-filter: brightness(100%);
  filter: brightness(100%);

  &:hover {
    opacity: 0.9;
  }

  svg {
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
  const hasStats = useRecoilValue(gamesPlayed) > 0;
  const state = useRecoilValue(gameStatus);
  const dispatch = useGameDispatch();
  const handleShare = useCallback(() => {
    dispatch({ type: "share" });
  }, [dispatch]);
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
        {hasStats ? <DistributionGraphs /> : <NoData>No Data</NoData>}
      </Distributions>
      {state !== "IN_PROGRESS" && (
        <Footer>
          <CountdownTimer />
          <Share>
            <ShareButton onClick={handleShare}>
              Share
              <Icon icon="share" />
            </ShareButton>
          </Share>
        </Footer>
      )}
    </Container>
  );
}

function classNameForBar(guessCount: number, highlight: boolean) {
  let ret = "";
  if (guessCount) {
    ret = "align-right";
  }
  if (highlight) {
    ret += " highlight";
  }
  return ret;
}

function DistributionGraphs() {
  const guessCounts = useRecoilValue(guesses);
  const mostGuesses = Math.max(
    ...times(6, (idx) => guessCounts[(idx + 1) as 1])
  );
  const highlightIdx = useRecoilValue(winningGuessCount);
  return (
    <>
      {times(6, (idx) => (
        <GraphContainer key={idx}>
          <div>{idx + 1}</div>
          <Graph>
            <GraphBar
              style={{
                width: `${Math.max(
                  7,
                  Math.round((guessCounts[(idx + 1) as 1] / mostGuesses) * 100)
                )}%`,
              }}
              className={classNameForBar(
                guessCounts[(idx + 1) as 1],
                highlightIdx === idx + 1
              )}
            >
              <NumGuesses>{guessCounts[(idx + 1) as 1]}</NumGuesses>
            </GraphBar>
          </Graph>
        </GraphContainer>
      ))}
    </>
  );
}

/** zero pad */
function zp(n: number) {
  return n.toString().padStart(2, "0");
}

const reload = () => location.reload();

function CountdownTimer() {
  const count = useCountdown(nextWordle) - 1;
  if (count < 0) {
    return (
      <Share>
        <ShareButton onClick={reload}>Reload!</ShareButton>
      </Share>
    );
  }
  const hours = Math.floor((count % 86400) / 3600);
  const minutes = zp(Math.floor((count % 3600) / 60));
  const seconds = zp(count % 60);
  return (
    <Countdown>
      <H1>Next WORDLE</H1>
      <StatContainer>
        <StatDiv className="timer">
          {hours}:{minutes}:{seconds}
        </StatDiv>
      </StatContainer>
    </Countdown>
  );
}
