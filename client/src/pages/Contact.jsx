import contactInfo from "../data/contactInfo";

function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">{contactInfo.name}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">{contactInfo.description}</p>

      <div className="mt-6 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="text-sm text-zinc-500">Email</div>
            <a className="font-medium block text-sky-600" href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
          </div>

          <div>
            <div className="text-sm text-zinc-500">LinkedIn</div>
            <a href={contactInfo.linkedIn} target="_blank" rel="noreferrer" className="block">{contactInfo.linkedIn}</a>
          </div>

          <div>
            <div className="text-sm text-zinc-500">GitHub</div>
            <a href={contactInfo.github} target="_blank" rel="noreferrer" className="block">{contactInfo.github}</a>
          </div>

          <div>
            <div className="text-sm text-zinc-500">Location</div>
            <div className="font-medium">{contactInfo.location}</div>
          </div>

          <div>
            <div className="text-sm text-zinc-500">Messages</div>
            <div className="mt-1 text-sm text-zinc-600">{contactInfo.messages}</div>
          </div>

          <div className="flex gap-6 mt-3 text-sm text-zinc-600">
            <div>
              <div className="text-sm text-zinc-500">Response time</div>
              <div className="font-medium">{contactInfo.responseTime}</div>
            </div>

            <div>
              <div className="text-sm text-zinc-500">Availability</div>
              <div className="font-medium">{contactInfo.availability}</div>
            </div>
          </div>
        </div>


      </div>

      <footer className="mt-8 text-center text-sm text-zinc-500">© 2026 | Made with ❤️</footer>
    </div>
  );
}

export default Contact;

