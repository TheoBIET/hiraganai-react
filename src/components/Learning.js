import { useRef, useState } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import { useStopwatch } from "react-timer-hook";
import Sound from "react-sound";

import { FaEraser, FaUndo, FaBug, FaPause, FaStar } from "react-icons/fa";
import { AiFillSound } from "react-icons/ai";
import Confetti from "react-confetti";
import CanvasDraw from "react-canvas-draw";
import axios from "axios";

import PauseMenu from "./PauseMenu";
import DataURIToBlob from "../utils/blob";
import CONSTANTS from "../constants";

const { SCORE_TABLE, HIRAGANA } = CONSTANTS;
const [phonetics, hiraganas] = [Object.keys(HIRAGANA), Object.values(HIRAGANA)];
const BASE_URL = "https://hiraganai-api.herokuapp.com/api/v1";
const PREDICT_URL = `${BASE_URL}/predict`;

function Learning() {
  // Refs
  const canvasDraw = useRef(null);
  const confetti = useRef(null);

  // States
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [lastPrediction, setLastPrediction] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLetterHidden, setIsLetterHidden] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);

  // Hooks
  const { width, height } = useWindowSize();
  const { seconds, minutes, pause, start, reset } = useStopwatch({
    autoStart: true,
  });

  const undo = () => {
    canvasDraw.current.undo();
  };

  const clear = () => {
    canvasDraw.current.clear();
  };

  const setSoundOn = () => {
    setIsSoundOn(true);
  };

  const runConfetti = () => {
    setIsSuccess(true);

    setTimeout(() => {
      passToNext();
    }, 500);

    setTimeout(() => {
      setIsSuccess(false);
    }, 1000);
  };

  const passToNext = () => {
    const points = SCORE_TABLE[failureCount] || 0;
    setScore(score + points);
    setFailureCount(0);
    setLastPrediction(null);
    clear();

    if (currentIndex < hiraganas.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsSoundOn(true);
    }

    if (currentIndex === hiraganas.length - 1) {
      pause();
    }
  };

  const getPrediction = async () => {
    const base64 = canvasDraw.current.getDataURL("image/png", "", "#ffffff");
    const file = DataURIToBlob(base64);
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(PREDICT_URL, formData);
    const { data } = response;
    const { prediction } = data;
    const [phonetic, hiragana, percentage] = prediction[0];
    return { phonetic, hiragana, percentage };
  };

  const handleSubmit = async () => {
    setIsWrong(false);
    const requestedHiragana = hiraganas[currentIndex];
    const { hiragana } = await getPrediction();
    setLastPrediction(hiragana);

    if (requestedHiragana === hiragana) {
      runConfetti();
      return;
    }

    setIsWrong(true);
    setFailureCount(failureCount + 1);
  };

  const handlePause = (value) => {
    setIsPaused(value);

    if (value) {
      return pause();
    }

    start();
  };

  const handleHideLetter = () => {
    setIsLetterHidden(!isLetterHidden);
  };

  const restart = () => {
    setIsPaused(false);
    setIsSuccess(false);
    setIsWrong(false);
    setFailureCount(0);
    setScore(0);
    setCurrentIndex(0);
    clear();
    reset();
  };

  return (
    <div className={`Learning ${isPaused ? "--no-scroll" : ""}`}>
      {/******** PAUSE MENU ********/}
      {isPaused && (
        <PauseMenu
          handlePause={handlePause}
          restart={restart}
          handleHideLetter={handleHideLetter}
          isLetterHidden={isLetterHidden}
        />
      )}
      {/****************************/}

      {/********* CONFETTI *********/}
      <Confetti
        numberOfPieces={isSuccess ? 200 : 0}
        ref={confetti}
        width={width}
        height={height}
      />
      {/****************************/}

      {/********* LETTER SOUND *********/}
      <Sound
        url={require(`../assets/sounds/${phonetics[currentIndex]}.mp3`)}
        playStatus={isSoundOn ? Sound.status.PLAYING : Sound.status.PAUSED}
        onFinishedPlaying={() => setIsSoundOn(false)}
        onError={(error) => setIsSoundOn(true)}
      />
      {/****************************/}

      {/** LEARNING HEADER */}
      <div className="Learning__header">
        <div className="Learning__header__row">
          <div className="Learning__header__row__pause">
            <FaPause
              onClick={() => {
                handlePause(true);
              }}
            />
          </div>
          <div className="Learning__header__row__timer">
            {minutes.toLocaleString("en-US", {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })}
            :
            {seconds.toLocaleString("en-US", {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })}
          </div>
        </div>
        <div className="Learning__header__row --center">
          <div className="Learning__header__row__score">
            {score}/{SCORE_TABLE[0] * currentIndex} <FaStar />
          </div>
        </div>
      </div>
      {/** LEARNING HEADER END */}

      {/** LEARNING BODY */}
      <div className={`Learning__drawer ${isWrong ? "--wrong" : ""}`}>
        <div className="Learning__drawer__info">
          <div>
            Target:{" "}
            {isLetterHidden
              ? `? (${phonetics[currentIndex]})`
              : `${hiraganas[currentIndex]} (${phonetics[currentIndex]})`}
          </div>
          <div>Predict: {lastPrediction ?? "?"}</div>
        </div>
        <div className="Learning__drawer__wrapper">
          <div className="Learning__drawer__wrapper__example">
            {isLetterHidden ? "" : `${hiraganas[currentIndex]}`}
          </div>
          <div
            className="Learning__drawer__wrapper__sound"
            onClick={setSoundOn}>
            <AiFillSound />
          </div>
          <CanvasDraw ref={canvasDraw} brushColor="black" lazyRadius={0} />
        </div>
        <div className="Learning__drawer__progress">
          <div className="Learning__drawer__progress__bar">
            <div
              className="Learning__drawer__progress__bar__fill"
              style={{
                width: `${((currentIndex + 1) / hiraganas.length) * 100}%`,
              }}
            />
            {phonetics.map((_, index) => {
              return index % 3 === 0 ? (
                <div
                  key={index}
                  className={`Learning__drawer__progress__bar__item ${
                    currentIndex >= index ? "--active" : ""
                  }`}></div>
              ) : null;
            })}
          </div>
        </div>
      </div>
      {/** LEARNING BODY END */}

      {/** LEARNING FOOTER */}
      <div className="Learning__actions">
        <div className="Learning__actions__row">
          <div className="button blue" onClick={undo}>
            <FaUndo />
          </div>
          <div className="button pink" onClick={clear}>
            <FaEraser />
          </div>
          {failureCount > 2 && (
            <div className="button red" onClick={passToNext}>
              <FaBug />
            </div>
          )}
        </div>

        <div className="Learning__actions__row">
          {failureCount > 2 && (
            <div className="button yellow" onClick={passToNext}>
              Pass
            </div>
          )}
          <div className="button green" onClick={handleSubmit}>
            Confirm
          </div>
        </div>
      </div>
      {/** LEARNING FOOTER END */}
    </div>
  );
}

export default Learning;
