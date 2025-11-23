// src/pages/dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        sessionStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("userRole");
        navigate("/login");
      }}
      className="...">
      Get started as reviewer
    </button>
  );
}
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-sky-50 to-indigo-50 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* HERO */}
        <header className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/80 border border-rose-100 px-3 py-1 text-xs text-rose-500 font-medium mb-3 shadow-sm">
              SDLC-based helper for checking AI tools
            </span>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
              A gentle framework for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">
                testing AI decision support systems
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 mb-5 max-w-xl">
              Think of it as a checklist that follows the normal software
              lifecycle – from idea to deployment – but focused on AI systems
              that give suggestions or recommendations. It helps you spot gaps
              early, not just after something goes wrong.
            </p>

            <div className="flex flex-wrap gap-3 mb-3">
              <Link to="/login">
                <button className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-400">
                  Get started as reviewer
                </button>
              </Link>
              <a href="#why">
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-2.5 text-sm text-slate-700 hover:bg-white">
                  Why does this matter?
                </button>
              </a>
            </div>

            <p className="text-xs text-slate-500">
              Designed for students, researchers, and teams working on
              AI-based decision support projects.
            </p>
          </div>

          {/* Soft illustration card */}
          <div className="relative">
            <div className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-5 space-y-4">
              <p className="text-xs font-medium text-slate-500">
                What this tool tries to do
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Turn vague AI “trust” into simple, concrete checks.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                  <span>
                    Keep track of decisions across requirements, design, code,
                    testing, and deployment.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-400" />
                  <span>
                    Produce a friendly summary you can share with supervisors,
                    teammates, or reviewers.
                  </span>
                </li>
              </ul>

              <div className="rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-100 px-4 py-3 text-xs text-slate-700">
                <p className="font-medium mb-1">Example questions it can help with:</p>
                <p>
                  “Have we clearly written down what the AI is allowed to do?”
                  “What happens if the AI is wrong?” “Who reviews changes over
                  time?”
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* WHY SECTION */}
        <section id="why" className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Why does a simple SDLC-based check help?
          </h2>
          <p className="text-sm text-slate-600 max-w-3xl">
            AI systems are often judged only by numbers like accuracy or AUC.
            But in practice, people also care about{" "}
            <span className="font-medium">clarity, safety, and everyday use</span>.
            A small oversight in requirements, documentation, or monitoring can
            cause confusion later – especially in domains like healthcare or
            finance.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/90 border border-slate-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-1 text-slate-900">
                See the bigger picture
              </h3>
              <p className="text-xs text-slate-600">
                Instead of only “Does the model work?”, you also ask “Is it
                clear what this system is for?” and “Who checks it later?”.
              </p>
            </div>
            <div className="rounded-2xl bg-white/90 border border-slate-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-1 text-slate-900">
                Make issues easier to talk about
              </h3>
              <p className="text-xs text-slate-600">
                The framework turns technical concerns into plain language so
                you can share them with supervisors or domain experts.
              </p>
            </div>
            <div className="rounded-2xl bg-white/90 border border-slate-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-1 text-slate-900">
                Build better habits
              </h3>
              <p className="text-xs text-slate-600">
                Each project you check teaches you to think more carefully about
                documentation, testing, and deployment next time.
              </p>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section id="use-cases" className="space-y-4 pb-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Where can this be useful?
          </h2>
          <p className="text-sm text-slate-600 max-w-3xl">
            Anywhere an AI system is helping people make decisions, not
            replacing them. Here are a few examples:
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/90 border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-rose-500 mb-1">
                Clinical help
              </p>
              <p className="text-sm font-medium text-slate-900 mb-1">
                Healthcare decision support
              </p>
              <p className="text-xs text-slate-600">
                Checking if an AI suggestion fits clinical guidelines, is
                clearly documented, and avoids surprising behaviour for doctors
                or nurses.
              </p>
            </div>

            <div className="rounded-2xl bg-white/90 border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-indigo-500 mb-1">
                Fairness & clarity
              </p>
              <p className="text-sm font-medium text-slate-900 mb-1">
                Credit and risk models
              </p>
              <p className="text-xs text-slate-600">
                Making sure requirements, explanations and simple sanity checks
                exist before scores are used for real people.
              </p>
            </div>

            <div className="rounded-2xl bg-white/90 border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-emerald-500 mb-1">
                Everyday operations
              </p>
              <p className="text-sm font-medium text-slate-900 mb-1">
                Scheduling and planning tools
              </p>
              <p className="text-xs text-slate-600">
                Keeping an eye on how an AI suggestion interacts with manual
                workflows, simple rules, and escalation paths.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
