import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import FlagTask from './fragTask/FlagTask';
import FlagAnswer from './fragTask/FlagAnswer';
import Finish from './fragTask/Finish';
import Controller from './DigitalClock/Controller';


function App() {
  return (
    <Router> {/* ここは関数コンポーネント内 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Clock" element={<Controller />} />
        <Route path="/FlagTask" element={<FlagTask />} />
        <Route path="/flagAnswer" element={<FlagAnswer />} />
        <Route path="/finish" element={<Finish />} />

      </Routes>
    </Router>
  );
}

export default App;