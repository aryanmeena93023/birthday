import React from 'react';
import CinematicIntro from '../../components/CinematicIntro/CinematicIntro';
import './Landing.css';

const Landing: React.FC = () => {
  return (
    <div className="landing-page">
      <CinematicIntro />
    </div>
  );
};

export default Landing;
