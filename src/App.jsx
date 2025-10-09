import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chat from "./components/Chat";
import Converter from "./components/Converter";
import Home from "./components/Home";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/converter" element={<Converter />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
