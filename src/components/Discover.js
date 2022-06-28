import axios from "axios";
import { useState, useRef } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import CanvasDraw from "react-canvas-draw";
import Confetti from "react-confetti";

import PauseMenu from "./PauseMenu";
import data from "../assets/data/words.json";
import { FaArrowLeft, FaArrowRight, FaUndo, FaEraser } from "react-icons/fa";
import DataURIToBlob from "../utils/blob";

const words = data.words;
const BASE_URL = "https://hiraganai-api.herokuapp.com/api/v1";
const PREDICT_URL = `${BASE_URL}/predict`;

export default function Discover() {
  // Refs
  const canvasDraw = useRef(null);
  const confetti = useRef(null);

  // States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [drawData, setDrawData] = useState({});
  const [failureIndex, setFailureIndex] = useState([]);
  const [successIndex, setSuccessIndex] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLetterHidden, setIsLetterHidden] = useState(false);

  // Hooks
  const { width, height } = useWindowSize();

  // Functions
  const handleLeft = () => {
    if (currentIndex === 0) return;
    setCurrentIndex(currentIndex - 1);
  };

  const handleRight = () => {
    if (currentIndex === words.length - 1) return;
    setCurrentIndex(currentIndex + 1);
  };

  const undo = () => {
    canvasDraw.current.undo();
  };

  const clear = () => {
    canvasDraw.current.clear();
  };

  const handleCurrentLetterIndex = (index) => {
    const base64 = canvasDraw.current.getDataURL("image/png", "", "#ffffff");

    setDrawData({
      ...drawData,
      [currentLetterIndex]: base64,
    });

    if (currentLetterIndex === words[currentIndex].hiraganas.length - 1) {
      return handleSubmit();
    }

    clear();
    setCurrentLetterIndex(index);
  };

  const handleSubmit = async () => {
    console.log("submit");
    for (let i = 0; i < currentLetterIndex; i++) {
      console.log(i);
      const requestedHiragana = words[currentIndex].hiraganas[i];
      const file = DataURIToBlob(drawData[i]);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(PREDICT_URL, formData);
      const { data } = response;
      const { prediction } = data;
      // eslint-disable-next-line no-unused-vars
      const [_, hiragana] = prediction[0];
      console.log(hiragana);

      requestedHiragana === hiragana
        ? setSuccessIndex([...successIndex, i])
        : setFailureIndex([...failureIndex, i]);
    }

    if (successIndex.length === Object.keys(drawData).length) {
      runConfetti();
      setCurrentLetterIndex(0);
      // setCurrentIndex(currentIndex + 1);
    }
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
    if (currentIndex === words.length - 1) {
      return setIsFinished(true);
    }

    setCurrentLetterIndex(currentLetterIndex + 1);
  };

  const handleHideLetter = () => {
    setIsLetterHidden(!isLetterHidden);
  };

  const handlePause = (value) => {
    setIsPaused(value);

    // if (value) {
    //   return pause();
    // }

    // start();
  };

  return (
    <div className="Discover">
      {/******** PAUSE MENU ********/}
      {(isPaused || isFinished) && (
        <PauseMenu
          handlePause={handlePause}
          isFinished={isFinished}
          handleHideLetter={handleHideLetter}
          isLetterHidden={isLetterHidden}
        />
      )}
      {/****************************/}

      {/********* CONFETTI *********/}
      <Confetti
        numberOfPieces={isSuccess || isFinished ? 200 : 0}
        ref={confetti}
        width={width}
        height={height}
      />
      {/****************************/}

      <div className="Discover__header" onClick={handlePause}>
        ||
      </div>

      <div className="Discover__content">
        <div className="Discover__content__word">
          <div className="Discover__content__word__text">
            🇬🇧 {words[currentIndex].word.english} <br />
            🇫🇷 {words[currentIndex].word.french} <br />
            👂 {words[currentIndex].word.hepburn} <br />
          </div>
          <div className="Discover__content__boxes">
            {words[currentIndex].hiraganas.map((hiragana, index) => {
              return (
                <div
                  key={index}
                  className={`Discover__content__boxes__box
                  ${currentLetterIndex === index ? "--active" : ""}
                  ${failureIndex.includes(index) ? "--failure" : ""}
                  ${successIndex.includes(index) ? "--success" : ""}`}
                  onClick={() => {
                    handleCurrentLetterIndex(index);
                  }}
                  style={{
                    backgroundImage: `url(${drawData[index]})`,
                    boxShadow:
                      currentLetterIndex === index
                        ? "inset 0px 0px 0px 2px #93c"
                        : "",
                  }}>
                  {drawData[index] ? null : hiragana.phoneme}
                </div>
              );
            })}
          </div>
        </div>

        <div className="Discover__content__drawer">
          <div className="Discover__content__drawer__example">
            {isLetterHidden
              ? ""
              : words[currentIndex].hiraganas[currentLetterIndex].char}
          </div>
          <CanvasDraw ref={canvasDraw} brushColor="black" lazyRadius={0} />
        </div>

        {/** LEARNING FOOTER */}
        <div className="Learning__actions">
          <div className="Learning__actions__row">
            <div className="button blue" onClick={undo}>
              <FaUndo />
            </div>
            <div className="button pink" onClick={clear}>
              <FaEraser />
            </div>
          </div>

          <div className="Learning__actions__row">
            <div
              className="button green"
              onClick={() => {
                handleCurrentLetterIndex(currentLetterIndex + 1);
              }}>
              {currentLetterIndex + 1 === words[currentIndex].hiraganas.length
                ? "Confirm"
                : "Next"}
            </div>
          </div>
        </div>
        {/** LEARNING FOOTER END */}

        <div className="Discover__content__stepper">
          <div
            className="Discover__content__stepper__arrow"
            onClick={handleLeft}>
            <FaArrowLeft />
          </div>
          <div className="Discover__content__stepper__number">
            {currentIndex + 1} / {words.length}
          </div>
          <div
            className="Discover__content__stepper__arrow"
            onClick={handleRight}>
            <FaArrowRight />
          </div>
        </div>
      </div>
    </div>
  );
}
