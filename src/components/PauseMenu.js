import { Link } from "react-router-dom";

import { FaPause, FaStar, FaRegClock } from "react-icons/fa";

export default function PauseMenu({
  handlePause,
  restart,
  handleHideLetter,
  isLetterHidden,
  isFinished,
  score,
  maxScore,
  time,
}) {
  const close = () => {
    handlePause(false);
  };

  const quit = () => {
    handlePause(false);
  };

  const pauseMenu = (
    <div className="PauseMenu__content">
      <div className="PauseMenu__content__title">
        <FaPause />
        <span>Pause Menu</span>
      </div>

      <div className="PauseMenu__content__buttons">
        <div className="button purple" onClick={close}>
          Resume
        </div>
        <div className="button purple" onClick={restart}>
          Restart
        </div>
        <div className="button purple" onClick={handleHideLetter}>
          {isLetterHidden ? "Show Letters" : "Hide Letters"}
        </div>
        <Link className="button red" to="/" onClick={quit}>
          Quit
        </Link>
      </div>
    </div>
  );

  const pauseMenuFinished = (
    <div className="PauseMenu__content">
      <div className="PauseMenu__content__text">
        <FaStar /> : {score} / {maxScore}
      </div>
      <div className="PauseMenu__content__text">
        <FaRegClock /> : {time}
      </div>
      <div className="PauseMenu__content__buttons">
        <div className="button purple" onClick={restart}>
          Restart
        </div>
        <Link className="button red" to="/" onClick={quit}>
          Quit
        </Link>
      </div>
    </div>
  );

  return (
    <div className="PauseMenu">
      <div className="PauseMenu__background" onClick={close}></div>
      {isFinished ? pauseMenuFinished : pauseMenu}
    </div>
  );
}
