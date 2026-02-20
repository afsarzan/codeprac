import React from 'react';

const PlaceholderView = ({ viewLabel }) => {
  return (
    <section className="intro-fade intro-delay-2">
      <div className="rounded-3xl border border-amber-200/20 bg-black/60 p-8 text-center">
        <h2 className="text-2xl font-semibold text-amber-50">
          {viewLabel}
        </h2>
        <p className="mt-3 text-sm text-amber-100/60">
          This module is planned for the next MVP iteration.
        </p>
      </div>
    </section>
  );
};

export default PlaceholderView;
