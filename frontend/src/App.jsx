import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Camera from "./pages/Camera";
import Chat from "./pages/Chat";
import Report from "./pages/Report";
import Choose from "./pages/Choose";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/choose" element={<Choose />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/camera" element={<Camera />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/report" element={<Report />} />
    </Routes>
  );
}

export default App;
