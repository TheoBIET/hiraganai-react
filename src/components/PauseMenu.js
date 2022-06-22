import { Link } from "react-router-dom";

import { FaPause } from "react-icons/fa";

export default function PauseMenu({ handlePause, restart, handleHideLetter, isLetterHidden }) {
  const close = () => {
    handlePause(false);
  };

  const quit = () => {
    handlePause(false);
  };

  return (
    <div className="PauseMenu">
      <div className="PauseMenu__background" onClick={close}></div>
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
    </div>
  );
}
