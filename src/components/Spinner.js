import React from 'react';

export default function Spinner({ message }) {
  return (
    <div className="spinner-overlay">
      <div className="spin-ring" />
      <p>{message}</p>
    </div>
  );
}
