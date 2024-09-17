import Board from '@/components/snake-game/board';
import { NextPageWithLayout } from '@/types/utils';

const SnakeGame: NextPageWithLayout = () => {
  return (
    <div className="grid h-screen place-items-center">
      <Board />
    </div>
  );
};

export default SnakeGame;

SnakeGame.getLayout = (page) => page;
