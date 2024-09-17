import { Button } from '@/components/ui/button';
import Circle from '@/components/ui/circle';
import useFirstRender from '@/hooks/useFirstRender';
import { cn } from '@/lib/utils';
import { CSSProperties, Fragment, useRef, useState } from 'react';

const boardGridSize = 70;
const playerCircleSize = 30;

const plates = [
  100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 81, 82, 83, 84, 85, 86, 87, 88, 89,
  90, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 61, 62, 63, 64, 65, 66, 67, 68,
  69, 70, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 41, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 1, 2, 3, 4, 5, 6, 7,
  8, 9, 10,
];

const stairs = [
  {
    id: '1',
    from: 6,
    to: 36,
  },
  {
    id: '2',
    from: 5,
    to: 36,
  },
  {
    id: '3',
    from: 9,
    to: 36,
  },
  {
    id: '4',
    from: 19,
    to: 38,
  },
  {
    id: '5',
    from: 30,
    to: 60,
  },
];

const Board = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const isPending = useRef(false);
  const isFirstRender = useFirstRender(0);
  const [winnerPlayerId, setWinnerPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState([
    {
      id: '1',
      name: 'Player 1',
      boardPosition: 1,
    },
    {
      id: '2',
      name: 'Player 2',
      boardPosition: 1,
    },
    {
      id: '3',
      name: 'Player 3',
      boardPosition: 1,
    },
    {
      id: '4',
      name: 'Player 4',
      boardPosition: 1,
    },
  ]);

  const gameOver = () => {
    setWinnerPlayerId(activePlayerId);
  };

  const restartGame = () => {
    setWinnerPlayerId(null);

    setTimeout(() => {
      setActivePlayerId(null);
      setPlayers((players) =>
        players.map((player) => ({ ...player, boardPosition: 1 }))
      );

      setTimeout(() => {
        setActivePlayerId(players[0].id);
      }, 700);
    }, 500);
  };

  const [activePlayerId, setActivePlayerId] = useState<string | null>('1');

  return (
    <div style={{ '--boardGridSize': `${boardGridSize}px` } as CSSProperties}>
      <ul className="mb-2 flex gap-5">
        {players.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>

      <div>
        <Button
          onClick={() => {
            if (isPending.current) return;

            const randomNumber = Math.floor(Math.random() * 7);
            console.log({ randomNumber });
            if (randomNumber) {
              isPending.current = true;
              setPlayers((players) => {
                return players.map((player) => {
                  if (player.id === activePlayerId) {
                    const boardPosition =
                      player.boardPosition + randomNumber > 100
                        ? 100
                        : player.boardPosition + randomNumber;
                    return {
                      ...player,
                      boardPosition,
                    };
                  }
                  return player;
                });
              });

              setPlayers((players) => {
                if (players.find((player) => player.boardPosition >= 100)) {
                  gameOver();
                } else {
                  setTimeout(() => {
                    const activePlayerIndex = players.findIndex(
                      (player) => player.id === activePlayerId
                    );
                    const activePlayer = players[activePlayerIndex];

                    const hasMatchedStair = stairs.find(
                      (stair) => stair.from === activePlayer.boardPosition
                    );
                    if (!!hasMatchedStair) {
                      players[activePlayerIndex].boardPosition =
                        hasMatchedStair.to;
                      setTimeout(() => {
                        const nextPlayerIndex = activePlayerIndex + 1;
                        const nextPlayer = players[nextPlayerIndex];
                        setActivePlayerId(nextPlayer?.id || players[0].id);
                        isPending.current = false;
                      }, 100);
                    } else {
                      const nextPlayerIndex = activePlayerIndex + 1;
                      const nextPlayer = players[nextPlayerIndex];
                      setActivePlayerId(nextPlayer?.id || players[0].id);
                      isPending.current = false;
                    }
                  }, 500);
                }

                return [...players];
              });
            }
          }}
        >
          Play Player {activePlayerId}
        </Button>
      </div>
      <div>
        <div
          ref={boardRef}
          className="relative grid aspect-square w-full grid-cols-[repeat(10,var(--boardGridSize))] grid-rows-[repeat(10,var(--boardGridSize))] gap-1 bg-muted p-1"
        >
          {plates.map((number) => (
            <div
              key={number}
              className="bg-background p-2 text-xl font-bold text-foreground/30"
              id={`plate_${number}`}
            >
              {number}
            </div>
          ))}

          {!isFirstRender &&
            players.map((player, i) => {
              const plate = document
                .getElementById(`plate_${player.boardPosition}`)
                ?.getBoundingClientRect();

              const boardRect = boardRef.current?.getBoundingClientRect();

              if (!boardRect || !plate)
                return <Fragment key={player.boardPosition} />;

              const isActivePlayer = activePlayerId === player.id;

              return (
                <Circle
                  style={
                    {
                      '--playerCircleSize': `${playerCircleSize}px`,
                      '--topPos': `${
                        plate!.top -
                        boardRect!.top +
                        (isActivePlayer
                          ? boardGridSize / 2 - playerCircleSize / 2
                          : boardGridSize - playerCircleSize)
                      }px`,
                      '--leftPos': `${
                        plate!.left -
                        boardRect!.left +
                        (isActivePlayer
                          ? boardGridSize / 2 - playerCircleSize / 2
                          : 0)
                      }px`,
                      '--offsetXWhenInactive': `${i * 10}px`,
                    } as CSSProperties
                  }
                  className={cn(
                    'absolute w-[--playerCircleSize] bg-foreground text-sm origin-bottom-left text-background top-[--topPos] left-[--leftPos] duration-300',
                    !isActivePlayer
                      ? 'scale-50 translate-x-[--offsetXWhenInactive] ring-1 ring-inset ring-background'
                      : ''
                  )}
                  key={player.id}
                >
                  {player.id}
                </Circle>
              );
            })}

          {!isFirstRender &&
            stairs.map((stair) => {
              const fromPlateRect = document
                .getElementById(`plate_${stair.from}`)
                ?.getBoundingClientRect();

              const toPlateRect = document
                .getElementById(`plate_${stair.to}`)
                ?.getBoundingClientRect();
              const boardRect = boardRef.current?.getBoundingClientRect();
              console.log({ ...stair, fromPlateRect, toPlateRect, boardRect });

              if (!boardRect || !fromPlateRect || !toPlateRect)
                return <Fragment key={stair.id} />;

              const toPlateOffsetTop = toPlateRect.top - boardRect.top;
              const fromPlateOffsetTop = fromPlateRect.top - boardRect.top;

              const stairHeight = fromPlateOffsetTop - toPlateOffsetTop;

              return (
                <div
                  style={{
                    height: stairHeight,
                    left: fromPlateRect.left - boardRect.left + 40,
                    bottom:
                      boardRect.bottom -
                      fromPlateRect.bottom +
                      boardGridSize / 2,
                  }}
                  key={stair.id}
                  className="absolute w-1 bg-white text-black"
                >
                  {/* {stair.from} - {stair.to} */}
                </div>
              );
            })}

          {winnerPlayerId && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-white/10 text-center text-5xl font-bold text-white backdrop-blur-sm">
              Game over <br />
              Winner Player {winnerPlayerId}
              <Button onClick={restartGame}>Restrat</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
