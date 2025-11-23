// src/pages/ReviewerDashboard.jsx
import React, { useState } from "react";

export default function ReviewerDashboard() {
  const reviewerId =
    sessionStorage.getItem("loggedInUser") || "reviewer@example.com";

  // Simple demo data so the page looks full even without backend
  const demoVerificationRun = {
    id: "VER-001",
    modelName: "ICU Triage DSS",
    modelVersion: "v1.2",
    domain: "Healthcare",
    summary:
      "The report says the system is mostly ready but needs clearer rollback plans and basic monitoring once deployed.",
  };

  const demoBundles = [
    {
      bundleId: "BUNDLE-001",
      projectName: "ICU DSS Evaluation",
      modelName: "ICU Triage DSS",
      domain: "Healthcare",
      status: "PENDING",
      sharedAt: "2025-11-21T10:45:00Z",
      userId: "dr_singh",
      notes: "Please let me know if I've missed any obvious checks.",
      sharedFiles: [
        { id: "file-1", name: "ICU_DSS_SRS.pdf", type: "Requirements" },
        { id: "file-2", name: "ICU_Tests.pdf", type: "Test results" },
        { id: "file-3", name: "ICU_Deployment_Plan.docx", type: "Deployment" },
      ],
    },
    {
      bundleId: "BUNDLE-002",
      projectName: "Credit Risk DSS",
      modelName: "Retail Credit DSS",
      domain: "Finance",
      status: "REVIEWED",
      sharedAt: "2025-11-20T09:10:00Z",
      userId: "risk_team",
      notes: "Pilot in one region only.",
      sharedFiles: [{ id: "file-4", name: "Credit_DSS_SRS.pdf", type: "Requirements" }],
    },
  ];

  const [tasks] = useState(demoBundles);
  const [selectedBundleId, setSelectedBundleId] = useState(
    demoBundles[0].bundleId
  );
  const selectedBundle = tasks.find((t) => t.bundleId === selectedBundleId);

  // Review state: keep it simple and human
  const [feeling, setFeeling] = useState("good");
  const [isComfortable, setIsComfortable] = useState(true);
  const [keywords, setKeywords] = useState({
    clear: true,
    thorough: true,
    realistic: false,
    tooHarsh: false,
    tooSoft: false,
  });
  const [comment, setComment] = useState("");

  const formatDate = (str) =>
    new Date(str).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const handleSubmit = () => {
    if (!comment.trim()) {
      alert("Please add a short comment so your feedback is useful 🙂");
      return;
    }

    const payload = {
      bundleId: selectedBundle.bundleId,
      reviewerId,
      feeling,
      isComfortable,
      keywords,
      comment: comment.trim(),
    };

    console.log("Review submitted (demo):", payload);
    alert("Thanks for your review. This will help improve the framework.");
    setComment("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-rose-50 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Reviewer dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-lg">
              Here you can look at verification reports that people have shared
              with you and leave gentle, honest feedback about how helpful they
              are.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                Logged in as
              </span>
              <span className="text-sm font-medium text-slate-800">
                {reviewerId}
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-800">
              {reviewerId[0]?.toUpperCase() || "R"}
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[260px,1fr]">
          {/* LEFT: Queue */}
          <aside className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Things to review
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {tasks.filter((t) => t.status === "PENDING").length} pending
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {tasks.map((task) => {
                const isSelected = task.bundleId === selectedBundleId;
                const isReviewed = task.status === "REVIEWED";

                return (
                  <button
                    key={task.bundleId}
                    onClick={() => setSelectedBundleId(task.bundleId)}
                    className={[
                      "w-full text-left rounded-xl border px-3 py-2.5 transition shadow-sm",
                      isSelected
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-slate-900">
                          {task.projectName}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {task.modelName} • {task.domain}
                        </p>
                      </div>
                      <span
                        className={[
                          "text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap",
                          isReviewed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200",
                        ].join(" ")}
                      >
                        {isReviewed ? "Reviewed" : "New"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Shared {formatDate(task.sharedAt)}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              You don’t need to write a “perfect” review. Simple comments like
              “this felt clear” or “I got lost here” are very helpful.
            </p>
          </aside>

          {/* RIGHT: Details + feedback */}
          <main className="bg-white/80 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            {!selectedBundle ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
                Choose something from the list on the left to start reviewing.
              </div>
            ) : (
              <>
                {/* Current bundle info */}
                <section className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-500">
                        Current report
                      </p>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedBundle.projectName}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Shared by{" "}
                        <span className="font-medium text-slate-700">
                          {selectedBundle.userId}
                        </span>{" "}
                        on {formatDate(selectedBundle.sharedAt)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>Domain: {selectedBundle.domain}</p>
                      <p>
                        Model: {demoVerificationRun.modelName} (
                        {demoVerificationRun.modelVersion})
                      </p>
                    </div>
                  </div>
                  {selectedBundle.notes && (
                    <div className="mt-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">
                      <span className="font-medium text-indigo-600">
                        Note from the author:
                      </span>{" "}
                      {selectedBundle.notes}
                    </div>
                  )}
                </section>

                {/* Files */}
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Files they’ve shared with you
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {selectedBundle.sharedFiles.length} file
                      {selectedBundle.sharedFiles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedBundle.sharedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3 space-y-1"
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {file.type || "Supporting document"}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400">
                            Open (mock)
                          </button>
                          <button className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                            Download (mock)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Short framework summary */}
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    What the framework said (short version)
                  </h3>
                  <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-3 text-xs sm:text-sm text-slate-700">
                    <p className="mb-1">
                      <span className="font-medium">
                        {demoVerificationRun.modelName}
                      </span>{" "}
                      – {demoVerificationRun.domain}
                    </p>
                    <p>{demoVerificationRun.summary}</p>
                  </div>
                </section>

                {/* Feedback form – more human wording */}
                <section className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      How did this report feel to you?
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Be kind but honest – this is for improving the tool.
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Feeling */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Your overall impression
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFeeling("great")}
                          className={[
                            "flex-1 rounded-lg border px-3 py-2 text-sm",
                            feeling === "great"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-700",
                          ].join(" ")}
                        >
                          Very helpful
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeeling("good")}
                          className={[
                            "flex-1 rounded-lg border px-3 py-2 text-sm",
                            feeling === "good"
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 bg-white text-slate-700",
                          ].join(" ")}
                        >
                          Mostly okay
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeeling("unclear")}
                          className={[
                            "flex-1 rounded-lg border px-3 py-2 text-sm",
                            feeling === "unclear"
                              ? "border-rose-300 bg-rose-50 text-rose-700"
                              : "border-slate-200 bg-white text-slate-700",
                          ].join(" ")}
                        >
                          Confusing
                        </button>
                      </div>
                    </div>

                    {/* Comfort */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Would you rely on this report?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsComfortable(true)}
                          className={[
                            "flex-1 rounded-lg border px-3 py-2 text-sm",
                            isComfortable
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-700",
                          ].join(" ")}
                        >
                          Yes, I’d be comfortable
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsComfortable(false)}
                          className={[
                            "flex-1 rounded-lg border px-3 py-2 text-sm",
                            !isComfortable
                              ? "border-rose-300 bg-rose-50 text-rose-700"
                              : "border-slate-200 bg-white text-slate-700",
                          ].join(" ")}
                        >
                          Not really
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">
                      Tick any words that describe the report:
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        ["clear", "Clear"],
                        ["thorough", "Thorough"],
                        ["realistic", "Practical / realistic"],
                        ["tooHarsh", "Too harsh / strict"],
                        ["tooSoft", "Too soft / forgiving"],
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setKeywords((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                          className={[
                            "px-3 py-1 rounded-full border",
                            keywords[key]
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                              : "bg-white border-slate-200 text-slate-600",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      A short note (what worked well, what didn’t)
                    </p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-y"
                      placeholder='Example: "The structure is nice and I enjoyed the summary, but I wanted one or two concrete examples of failure cases."'
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setComment("")}
                      className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Clear comment
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 rounded-lg bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 shadow-md"
                    >
                      Submit review
                    </button>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>

        {/* Bottom: reviewed summary */}
        <section className="pb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Recently reviewed
          </h2>
          <div className="space-y-2">
            {tasks.filter((t) => t.status === "REVIEWED").length === 0 ? (
              <p className="text-xs text-slate-500">
                Once you submit a few reviews, they’ll show up here so you can
                see what you’ve already looked at.
              </p>
            ) : (
              tasks
                .filter((t) => t.status === "REVIEWED")
                .map((t) => (
                  <div
                    key={t.bundleId}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {t.projectName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {t.modelName} • {t.domain}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Reviewed around {formatDate(t.sharedAt)}
                    </p>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
