import React from "react";

const Title = ({ title, description }) => {
  return (
    <div className="mt-6 max-w-2xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-muted">{description}</p>
    </div>
  );
};

export default Title;
