import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Landing from "./components/Landing";
import Learning from "./components/Learning";
import Find from "./components/Find";
import Discover from "./components/Discover";

export default function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/find" element={<Find />} />
          <Route path="/discover" element={<Discover />} />
        </Routes>
      </Router>
    </div>
  );
}
