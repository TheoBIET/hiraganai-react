import { useRef } from "react";
import { FaEraser, FaUndo } from "react-icons/fa";

import CanvasDraw from "react-canvas-draw";
import axios from "axios";
import DataURIToBlob from "./utils/blob";

function App() {
  const BASE_URL = "http://localhost:8080/api/v1";
  const PREDICT_URL = `${BASE_URL}/predict`;
  const canvasDraw = useRef(null);

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

  return (
    <div className="App">
      <h1>Nihongo</h1>
      <p>Learn Japanese Alphabet with AI</p>
      <div class="container">
        <div className="container__drawer">
          <CanvasDraw ref={canvasDraw} brushColor="black" lazyRadius={0} />
        </div>
        <div className="">
          <div className="is-flex">
            <div className="button is-info" onClick={undo}>
              <FaUndo />
            </div>
            <div className="button is-danger" onClick={clear}>
              <FaEraser />
            </div>
          </div>
          <div className="button is-warning" onClick={getPrediction}>
            Make Prediction
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
