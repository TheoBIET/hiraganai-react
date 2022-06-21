import { useRef, useState } from "react";
import { FaEraser, FaUndo } from "react-icons/fa";
import { MdOutlineDoubleArrow } from "react-icons/md";

import CanvasDraw from "react-canvas-draw";
import axios from "axios";
import DataURIToBlob from "../utils/blob";
import HIRAGANA from "../constants/hiragana";

function Learning() {
  const BASE_URL = "http://localhost:8080/api/v1";
  const PREDICT_URL = `${BASE_URL}/predict`;
  const hiraganaLength = Object.keys(HIRAGANA).length;
  const [phonetics, hiraganas] = [
    Object.keys(HIRAGANA),
    Object.values(HIRAGANA),
  ];
  const canvasDraw = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const undo = () => {
    canvasDraw.current.undo();
  };

  const clear = () => {
    canvasDraw.current.clear();
  };

  const getPrediction = async () => {
    const base64 = canvasDraw.current.getDataURL("image/png", "", "#ffffff");
    const file = DataURIToBlob(base64);
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(PREDICT_URL, formData);
    const { data } = response;
    const { prediction } = data;
    const [phonetic, hiragana, percentage] = prediction;
    return { phonetic, hiragana, percentage };
  };

  const passToNext = () => {
    clear();

    if (currentIndex < hiraganaLength - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div class="Learning">
      <div className="Learning__progress">
        <div className="Learning__progress__bar">
          <div
            className="Learning__progress__bar__fill"
            style={{
              width: `${(currentIndex / hiraganaLength) * 100}%`,
            }}
          />
          {phonetics.map((key, index) => {
            if (index % 3 === 0) {
              return (
                <div
                  className={`Learning__progress__bar__item ${
                    currentIndex >= index ? "--active" : ""
                  }`}></div>
              );
            }

            return null;
          })}
        </div>
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

        <div className="button yellow" onClick={passToNext}>
          <MdOutlineDoubleArrow />
        </div>
      </div>
      <div className="Learning__row mt">
        <div className="button red" onClick={getPrediction}>
          Confirm
        </div>
      </div>
    </div>
  );
}

export default Learning;
