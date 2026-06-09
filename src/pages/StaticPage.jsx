const StaticPage = ({ title, subtitle }) => {
  return (
    <div>
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-100 py-20">
        <div className="container-custom text-center">
          <p className="section-kicker">Vision</p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-normal text-slate-950">{title}</h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">{subtitle}</p>
        </div>
      </section>
      <section className="container-custom py-16">
        <div className="rounded-lg border border-slate-100 bg-white p-10 text-center shadow-sm">
          <h2 className="mb-3 text-2xl font-black text-slate-950">Frontend Page</h2>
          <p className="text-slate-600">This static page is included so the navigation has a real destination in the frontend build.</p>
        </div>
      </section>
    </div>
  );
};

export default StaticPage;
