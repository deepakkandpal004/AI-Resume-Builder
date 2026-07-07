const Title = ({ title, description }) => (
  <div className="max-w-3xl text-center">
    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
      {title}
    </h2>
    {description && (
      <p className="mt-5 text-base leading-relaxed text-body sm:text-lg max-w-2xl mx-auto">
        {description}
      </p>
    )}
  </div>
);

export default Title;
