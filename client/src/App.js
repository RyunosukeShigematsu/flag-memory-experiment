import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';

import Controller from './DigitalClock/Controller';
import LoginClock from './DigitalClock/LoginClock';
import PracticeClock from "./DigitalClock/PracticeClock";

import FlagTask from './Flag/FlagTask';
import FlagAnswer from './Flag/FlagAnswer';
import FlagFinish from './Flag/FlagFinish';
import FlagRest from './Flag/FlagRest';
import PracticeFlagTask from "./Flag/practiceFlagTask";
import PracticeFlagAnswer from "./Flag/practiceFlagAnswer";
import FlagLogin from './Flag/FlagLogin'; 
import Cpnsent from './Flag/Consent';

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
        <Route path="/flagLogin" element={<FlagLogin />} />
        <Route path="/Consent" element={<Cpnsent />} />

      </Routes>
    </Router>
  );
}

export default App;