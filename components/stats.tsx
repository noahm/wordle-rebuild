import { useCallback } from "react";
import { RecoilValue, useRecoilValue, useSetRecoilState } from "recoil";
import { useCountdown, useCounter, useIntervalWhen } from "rooks";
import styled from "styled-components";
import { useGameDispatch } from "../lib/actions";
import { nextWordle } from "../lib/logic";
import {
  firstPlayedTs,
  gameStatus,
  todaysTime,
  winningGuessCount,
} from "../lib/state";
import {
  averageTime,
  currentStreak,
  gamesPlayed,
  guesses,
  maxStreak,
  winPercentage,
} from "../lib/stats";
import { clockDisplayForSeconds, times } from "../lib/utils";
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
  justify-content: stretch;

  & > * {
    flex-grow: 1;
  }
  & > *:not(:last-child) {
    border-right: 1px solid var(--color-tone-1);
    padding-right: 12px;
  }
  & > *:not(:first-child) {
    padding-left: 12px;
  }
`;

const Share = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
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
  padding: 12px 20px;
  font-size: 20px;
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

function RecoilStat({
  source,
  label,
}: {
  source: RecoilValue<number>;
  label: string;
  format?: (n: number) => number | string;
}) {
  const n = useRecoilValue(source);
  return <Stat value={n} label={label} />;
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <StatContainer>
      <StatDiv>{value}</StatDiv>
      <StatLabel>{label}</StatLabel>
    </StatContainer>
  );
}

function TimeStats() {
  const avgTime = useRecoilValue(averageTime);
  return (
    <>
      {!!avgTime && (
        <Stat value={clockDisplayForSeconds(avgTime)} label="Average Time" />
      )}
    </>
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
        <RecoilStat source={gamesPlayed} label="Played" />
        <RecoilStat source={winPercentage} label="Won %" />
        <RecoilStat source={currentStreak} label="Current Streak" />
        <RecoilStat source={maxStreak} label="Max Streak" />
        <TimeStats />
      </Statistics>
      <H1>Guess Distribution</H1>
      <Distributions>
        {hasStats ? <DistributionGraphs /> : <NoData>No Data</NoData>}
      </Distributions>
      {state === "IN_PROGRESS" ? (
        <Footer>
          <CountupTimer />
        </Footer>
      ) : (
        <Footer>
          <CountdownTimer />
          <Share>
            <ShareButton onClick={handleShare}>
              Share
              <Icon icon="share" />
            </ShareButton>
          </Share>
          <TodaysTime />
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

  return (
    <div>
      <H1>Next WORDLE</H1>
      <StatContainer>
        <StatDiv className="timer">{clockDisplayForSeconds(count)}</StatDiv>
      </StatContainer>
    </div>
  );
}

function CountupTimer() {
  const firstPlay = useRecoilValue(firstPlayedTs);
  const { increment, value: time } = useCounter(
    Math.round((Date.now() - firstPlay) / 1000)
  );
  useIntervalWhen(increment, 1000, !!firstPlay);
  if (!firstPlay) {
    return null;
  }
  return (
    <div>
      <H1>Played Today</H1>
      <StatContainer>
        <StatDiv className="timer">{clockDisplayForSeconds(time)}</StatDiv>
      </StatContainer>
    </div>
  );
}

function TodaysTime() {
  const time = useRecoilValue(todaysTime);
  return (
    <div>
      <H1>Today&apos;s Time</H1>
      <StatContainer>
        <StatDiv className="timer">{clockDisplayForSeconds(time)}</StatDiv>
      </StatContainer>
    </div>
  );
}
