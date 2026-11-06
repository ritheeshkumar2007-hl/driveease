import { useState } from 'react';
import { carSvg } from '../carArt.js';

export default function CarImg({ car, className = '' }) {
  const [failed, setFailed] = useState(false);
  const useReal = car.image && !failed;
  return (
    <div className={'carimg ' + className}>
      {useReal ? (
        <img src={car.image} alt={car.name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="art" dangerouslySetInnerHTML={{ __html: carSvg(car) }} />
      )}
      <span className="pill">{car.type}</span>
    </div>
  );
}
