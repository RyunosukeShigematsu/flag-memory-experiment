import './Home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="button-group">
        <button
          onClick={() => navigate('/PracticeClock')}
          className="home-start-button clock"
        >
          時計タスク
        </button>

        <button
          onClick={() => navigate('/Consent')}
          className="home-start-button flag"
        >
          国旗タスク
        </button>
      </div>
    </div>
  );
}

export default Home;
