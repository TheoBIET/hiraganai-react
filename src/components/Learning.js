import { useRef, useState } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import { useStopwatch } from "react-timer-hook";

import { FaEraser, FaUndo, FaBug } from "react-icons/fa";
import Confetti from "react-confetti";
import CanvasDraw from "react-canvas-draw";
import axios from "axios";

import DataURIToBlob from "../utils/blob";
import HIRAGANA from "../constants/hiragana";
const [phonetics, hiraganas] = [Object.keys(HIRAGANA), Object.values(HIRAGANA)];
const BASE_URL = "https://hiraganai-api.herokuapp.com/api/v1";
const PREDICT_URL = `${BASE_URL}/predict`;
const SCORE_TABLE = {
  0: 5,
  1: 3,
  2: 1,
};

function Learning() {
  const { width, height } = useWindowSize();
  const canvasDraw = useRef(null);
  const confetti = useRef(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastPrediction, setLastPrediction] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [score, setScore] = useState(0);
  const { seconds, minutes, pause } = useStopwatch({
    autoStart: true,
  });

  const undo = () => {
    canvasDraw.current.undo();
  };

  const clear = () => {
    canvasDraw.current.clear();
  };

  const runConfetti = () => {
    setIsSuccess(true);

    setTimeout(() => {
      passToNext();
    }, 1000);

    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  const passToNext = () => {
    const points = SCORE_TABLE[failureCount] || 0;
    setScore(score + points);
    setFailureCount(0);
    setLastPrediction(null);
    clear();

    if (currentIndex < hiraganas.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
    const requestedHiragana = hiraganas[currentIndex];
    const { hiragana } = await getPrediction();
    setLastPrediction(hiragana);

    if (requestedHiragana === hiragana) {
      runConfetti();
      return;
    }

    setFailureCount(failureCount + 1);
  };

  return (
    <div className="Learning">
      <Confetti
        numberOfPieces={isSuccess ? 200 : 0}
        ref={confetti}
        width={width}
        height={height}
      />
      <div className="Learning__progress">
        <div className="Learning__progress__bar">
          <div
            className="Learning__progress__bar__fill"
            style={{
              width: `${((currentIndex + 1) / hiraganas.length) * 100}%`,
            }}
          />
          {phonetics.map((_, index) => {
            if (index % 3 === 0) {
              return (
                <div
                  key={index}
                  className={`Learning__progress__bar__item ${
                    currentIndex >= index ? "--active" : ""
                  }`}></div>
              );
            }

            return null;
          })}
        </div>
      </div>
      <div className="Learning__info">
        <div>
          Time:{" "}
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
        <div>
          Score: {score} / {SCORE_TABLE[0] * (currentIndex + 1)}
        </div>
        <div>Attempt: {failureCount + 1}</div>
        <div>Target: {hiraganas[currentIndex]}</div>
        {lastPrediction && <div>Predict: {lastPrediction}</div>}
      </div>
      <div className="Learning__drawer">
        <div className="Learning__drawer__example">
          {hiraganas[currentIndex]}
        </div>
        <CanvasDraw ref={canvasDraw} brushColor="black" lazyRadius={0} />
      </div>
      <div className="Learning__row">
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
      <div className="Learning__row mt">
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
  );
}

export default Learning;
