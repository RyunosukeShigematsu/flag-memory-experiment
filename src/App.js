import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import FlagTask from './fragTask/FlagTask';
import FlagAnswer from './fragTask/FlagAnswer';
import FlagFinish from './fragTask/FlagFinish';
import FlagRest from './fragTask/FlagRest';
import PracticeFlagTask from "./fragTask/practiceFlagTask";
import PracticeFlagAnswer from "./fragTask/practiceFlagAnswer";
import Controller from './DigitalClock/Controller';
import LoginClock from './DigitalClock/LoginClock';
import PracticeClock from "./DigitalClock/PracticeClock";



function App() {
  return (
    <Router> {/* ここは関数コンポーネント内 */}
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* 時計 */}
        <Route path="/Clock" element={<Controller />} />
        <Route path="/loginClock" element={<LoginClock />} />
        <Route path="/PracticeClock" element={<PracticeClock />} />

        {/* 国旗 */}
        <Route path="/FlagTask" element={<FlagTask />} />
        <Route path="/flagAnswer" element={<FlagAnswer />} />
        <Route path="/flagRest" element={<FlagRest />} />
        <Route path="/flagFinish" element={<FlagFinish />} />
        <Route path="/practiceFlagTask" element={<PracticeFlagTask />} />
        <Route path="/practiceFlagAnswer" element={<PracticeFlagAnswer />} />

      </Routes>
    </Router>
  );
}

export default App;