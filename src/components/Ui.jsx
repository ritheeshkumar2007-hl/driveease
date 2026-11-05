import { PHOTO_LIB } from '../data.js';

export function Img({ src, alt }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async"
    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = PHOTO_LIB.generic; }} />;
}

export function Modal({ children, onClose, wide }) {
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={'box' + (wide ? ' wide' : '')}>{children}</div>
    </div>
  );
}
