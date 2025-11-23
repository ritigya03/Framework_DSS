import { useState, useEffect } from "react";
import {
  Upload,
  FileCheck,
  Sparkles,
  MessageSquare,
  Send,
  Bot,
  User,
  CheckCircle,
  FileText,
  Layout,
  Code,
  TestTube,
  Rocket,
  Settings,
  FileDown,
  UserCheck,
} from "lucide-react";

import "../styles/SDLCAnalyzer.css";

const API_BASE_URL = "http://localhost:8000";

function SDLCAnalyzer() {
  const [files, setFiles] = useState([]);
  const [serverFiles, setServerFiles] = useState([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [sendingToReviewer, setSendingToReviewer] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hello! I'm your SDLC Analysis Assistant. I can help you understand your project analysis results and answer questions about SDLC best practices. How can I help you today?",
    },
  ]);

  const phaseIcons = {
    requirements: FileText,
    design: Layout,
    implementation: Code,
    testing: TestTube,
    deployment: Rocket,
    maintenance: Settings,
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes expandCard {
        0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setUploadStatus("");
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("❌ Please select files first!");
      return;
    }

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    try {
      setLoading(true);
      setUploadStatus("⏳ Uploading files...");

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data?.success) {
        setServerFiles(data.files || []);
        setUploadedCount((data.files || []).length);
        setUploadStatus(`✅ ${data.message || "Files uploaded successfully"}`);
      }
    } catch (err) {
      setUploadStatus(`❌ Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setUploadStatus("⏳ Analyzing project... This may take 30-60 seconds.");

      const res = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data?.phases) {
        setAnalysisResults(data);
        setUploadStatus("");
        if (data.files_analyzed) {
          setServerFiles(data.files_analyzed);
          setUploadedCount(data.files_analyzed.length);
        }
      }
    } catch (err) {
      setUploadStatus(`❌ Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setPdfGenerating(true);
      setUploadStatus("⏳ Generating PDF report...");
      
      const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisResults: analysisResults,
          overallScore: overallScore(),
          filesAnalyzed: serverFiles
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SDLC_Verification_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setUploadStatus("✅ PDF report generated and downloaded!");
      } else {
        setUploadStatus("❌ Failed to generate PDF report");
      }
    } catch (error) {
      setUploadStatus(`❌ PDF generation failed: ${error.message}`);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleSendToReviewer = async () => {
    try {
      setSendingToReviewer(true);
      setUploadStatus("⏳ Sending to reviewer...");
      
      const response = await fetch(`${API_BASE_URL}/send-to-reviewer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisResults: analysisResults,
          overallScore: overallScore(),
          filesAnalyzed: serverFiles,
          timestamp: new Date().toISOString()
        }),
      });
      
      const data = await response.json();
      
      if (data && data.success) {
        setUploadStatus(`✅ ${data.message || "Report sent to reviewer successfully!"}`);
      } else {
        setUploadStatus("❌ Failed to send report to reviewer");
      }
    } catch (error) {
      setUploadStatus(`❌ Failed to send to reviewer: ${error.message}`);
    } finally {
      setSendingToReviewer(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const fd = new FormData();
      fd.append("message", userMessage.content);

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      const aiText = (data?.response || data?.message || "No response").replace(
        /(\d+\.\s)/g,
        "\n$1"
      );

      setMessages((prev) => [...prev, { role: "ai", content: aiText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const overallScore = () => {
    if (!analysisResults?.phases) return 0;
    const vals = Object.values(analysisResults.phases);
    const total = vals.reduce((s, p) => s + (Number(p.score) || 0), 0);
    return vals.length ? (total / vals.length).toFixed(1) : "0.0";
  };

  const getPhaseColor = (phase) =>
    ({
      requirements: "#a8c7fa",
      design: "#c5b3e6",
      implementation: "#a8e6cf",
      testing: "#ffa8d4",
      deployment: "#ffd4a8",
      maintenance: "#a8e1fa",
    }[phase] || "#a8c7fa");

  return (
    <div className="app">
      <header className="header">
        <div className="headerContent">
          <p className="headerSubtitle">
            Design and Development of an SDLC-based Framework for Verifying
            AI-based Decision Support Systems
          </p>
        </div>
      </header>

      <div className="mainLayout">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="sidebarTitle">
            <Upload size={20} /> Upload Project Files
          </h2>

          <div className="uploadSection">
            <div className="fileInputWrapper">
              <label htmlFor="file-upload" className="fileInputLabel">
                <FileCheck size={20} />
                Choose Files
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="fileInput"
                onChange={handleFileChange}
              />
            </div>

            {files.length > 0 && (
              <div className="fileList">
                <div className="fileListHeader">
                  {files.length} file(s) selected locally
                </div>
                {files.map((f, idx) => (
                  <div key={idx} className="fileItem">
                    <FileText size={16} />
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <button
            className={`uploadBtn ${
              loading || files.length === 0 ? "btnDisabled" : ""
            }`}
            disabled={loading || files.length === 0}
            onClick={handleUpload}
          >
            <Upload size={18} />
            {loading && uploadStatus.includes("Uploading")
              ? "Uploading..."
              : "Upload Files"}
          </button>

          <button
            className={`analyzeBtn ${
              loading || serverFiles.length === 0 ? "btnDisabled" : ""
            }`}
            disabled={loading || serverFiles.length === 0}
            onClick={handleAnalyze}
          >
            <Sparkles size={18} />
            {loading && uploadStatus.includes("Analyzing")
              ? "Analyzing..."
              : "Analyze Project"}
          </button>

          {/* PDF & Reviewer Buttons - Only show after analysis */}
          {analysisResults && (
            <>
              <button
                className={`pdfBtn ${pdfGenerating ? "btnDisabled" : ""}`}
                disabled={pdfGenerating}
                onClick={handleGeneratePDF}
              >
                <FileDown size={18} />
                {pdfGenerating ? "Generating..." : "Generate PDF Report"}
              </button>

              <button
                className={`reviewerBtn ${sendingToReviewer ? "btnDisabled" : ""}`}
                disabled={sendingToReviewer}
                onClick={handleSendToReviewer}
              >
                <UserCheck size={18} />
                {sendingToReviewer ? "Sending..." : "Send to Reviewer"}
              </button>
            </>
          )}

          {serverFiles.length > 0 && (
            <div className="serverFiles">
              <strong>Server saved files:</strong>
              <div className="uploadedCount">
                {uploadedCount} file(s) saved on server
              </div>

              {serverFiles.map((sf, i) => (
                <div key={i} className="serverFileItem">
                  {sf}
                </div>
              ))}
            </div>
          )}

          {uploadStatus && (
            <div className="uploadStatus">{uploadStatus}</div>
          )}

          {!showChat && analysisResults && (
            <button className="chatBtn" onClick={() => setShowChat(true)}>
              <MessageSquare size={18} /> Chat with AI
            </button>
          )}

          {showChat && (
            <button className="chatBtn" onClick={() => setShowChat(false)}>
              <CheckCircle size={18} /> View Analysis
            </button>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="mainContent">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <div className="loadingText">Processing your request...</div>
              {uploadStatus.includes("Analyzing") && (
                <div className="loadingSubtext">
                  This may take 30-60 seconds while AI analyzes your project
                </div>
              )}
            </div>
          ) : showChat ? (
            <div className="chatContainer">
              <div className="chatHeader">
                <Bot size={24} />
                <h3 className="chatHeaderTitle">AI Assistant</h3>
              </div>

              <div className="chatMessages">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`chatMessage ${
                      m.role === "user" ? "chatMessageUser" : ""
                    }`}
                  >
                    <div
                      className={`messageAvatar ${
                        m.role === "ai"
                          ? "messageAvatarAi"
                          : "messageAvatarUser"
                      }`}
                    >
                      {m.role === "ai" ? <Bot size={20} /> : <User size={20} />}
                    </div>

                    <div
                      className={`messageContent ${
                        m.role === "ai"
                          ? "messageContentAi"
                          : "messageContentUser"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="chatMessage">
                    <div className="messageAvatar messageAvatarAi">
                      <Bot size={20} />
                    </div>
                    <div className="messageContent messageContentAi">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="chatInputContainer">
                <div className="chatInputWrapper">
                  <input
                    type="text"
                    className="chatInput"
                    placeholder="Ask me anything about your analysis..."
                    value={chatInput}
                    disabled={chatLoading}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      !chatLoading &&
                      handleSendMessage()
                    }
                  />
                  <button
                    className={`sendBtn ${
                      chatLoading || !chatInput.trim() ? "btnDisabled" : ""
                    }`}
                    disabled={chatLoading || !chatInput.trim()}
                    onClick={handleSendMessage}
                  >
                    <Send size={18} /> Send
                  </button>
                </div>
              </div>
            </div>
          ) : analysisResults ? (
            <div className="analysisResults">
              {expandedCard && (
                <div
                  className="overlay"
                  onClick={() => setExpandedCard(null)}
                ></div>
              )}

              <div className="analysisHeader">
                <div className="overallScore">{overallScore()}/100</div>
                <p className="overallScoreLabel">
                  Overall SDLC Compliance Score
                </p>
              </div>

              <div className="phasesGrid">
                {Object.entries(analysisResults.phases).map(
                  ([phaseName, data]) => {
                    const Icon = phaseIcons[phaseName];
                    const phaseColor = getPhaseColor(phaseName);
                    const isOpen = expandedCard === phaseName;

                    return (
                      <div
                        key={phaseName}
                        className={`phaseCard ${
                          isOpen ? "phaseCardExpanded" : ""
                        }`}
                        style={{ borderLeft: `4px solid ${phaseColor}` }}
                        onClick={() => setExpandedCard(phaseName)}
                      >
                        <div className="phaseHeader">
                          <div className="phaseTitle">
                            <div
                              className="phaseIcon"
                              style={{ backgroundColor: phaseColor }}
                            >
                              <Icon size={20} />
                            </div>
                            <h3 className="phaseH3">
                              {phaseName[0].toUpperCase() +
                                phaseName.slice(1)}
                            </h3>
                          </div>

                          <div className="phaseScore">
                            {data.score || 0}/100
                          </div>
                        </div>

                        <div
                          className={`phaseDetails ${
                            isOpen ? "phaseDetailsExpanded" : ""
                          }`}
                        >
                          {data.analysis ? (
                            <>
                              <h4 className="phaseDetailsH4">Analysis</h4>
                              <p className="phaseAnalysis">{data.analysis}</p>
                            </>
                          ) : (
                            <>
                              <div>
                                <h4 className="phaseDetailsH4">✓ Strengths</h4>
                                <ul className="phaseList">
                                  {data.strengths?.length > 0 ? (
                                    data.strengths.map((s, idx) => (
                                      <li key={idx} className="phaseLi">
                                        {s}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="phaseLi">
                                      No strengths identified
                                    </li>
                                  )}
                                </ul>
                              </div>

                              <div>
                                <h4 className="phaseDetailsH4">
                                  → Recommendations
                                </h4>
                                <ul className="phaseList">
                                  {data.recommendations?.length > 0 ? (
                                    data.recommendations.map((r, idx) => (
                                      <li key={idx} className="phaseLi">
                                        {r}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="phaseLi">
                                      No recommendations
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <div className="welcomeScreen">
              <div className="welcomeIcon">
                <Sparkles size={48} />
              </div>
              <h2 className="welcomeH2">Welcome to SDLC AI Verifier</h2>
              <p className="welcomeP">
                Upload your SRS, design documents, implementation files, and
                test specs.  
                AI will analyze each SDLC phase and provide improvements.
              </p>

              <div className="welcomeSteps">
                <h3 className="welcomeStepsH3">How to use:</h3>
                <ol className="welcomeStepsOl">
                  <li className="welcomeStepsLi">Choose your files</li>
                  <li className="welcomeStepsLi">Upload them</li>
                  <li className="welcomeStepsLi">Run project analysis</li>
                  <li className="welcomeStepsLi">Generate PDF or send to reviewer</li>
                  <li className="welcomeStepsLi">Chat with AI to refine</li>
                </ol>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default SDLCAnalyzer;