import { useEffect, useState } from "react";
import { Upload, FileCheck, Sparkles, MessageSquare, Send, Bot, User, CheckCircle, AlertCircle, FileText, Layout, Code, TestTube, Rocket, Settings } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

function App() {
  const [files, setFiles] = useState([]);
  const [serverFiles, setServerFiles] = useState([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I'm your SDLC Analysis Assistant. I can help you understand your project analysis results and answer questions about SDLC best practices. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const phaseIcons = {
    requirements: FileText,
    design: Layout,
    implementation: Code,
    testing: TestTube,
    deployment: Rocket,
    maintenance: Settings,
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setUploadStatus("");
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("❌ Please select files first!");
      return;
    }
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    
    try {
      setLoading(true);
      setUploadStatus("⏳ Uploading files...");
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data && data.success) {
        const saved = data.files || [];
        setServerFiles(saved);
        setUploadedCount(saved.length);
        setUploadStatus(`✅ ${data.message || "Files uploaded successfully"}`);
      }
    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setUploadStatus("⏳ Analyzing project... This may take 30-60 seconds.");
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      if (data && data.phases) {
        setAnalysisResults(data);
        setUploadStatus("");
        if (data.files_analyzed) {
          setServerFiles(data.files_analyzed);
          setUploadedCount(data.files_analyzed.length);
        }
      }
    } catch (error) {
      setUploadStatus(`❌ Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
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
      fd.append("message", chatInput);
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        body: fd,
      });
      const data = await response.json();
      const aiText = data?.response || data?.message || "No response from AI";
      setMessages((prev) => [...prev, { role: "ai", content: aiText }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: `Sorry, I encountered an error. Please try again.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const calculateOverallScore = () => {
    if (!analysisResults?.phases) return 0;
    const phases = Object.values(analysisResults.phases);
    const total = phases.reduce((sum, phase) => sum + (Number(phase.score) || 0), 0);
    return phases.length ? (total / phases.length).toFixed(1) : "0.0";
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
        
          <p style={styles.headerSubtitle}>Design and Development of an SDLC-based Framework for Verifying AI-based Decision Support Systems</p>
        </div>
      </header>

      <div style={styles.mainLayout}>
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>
            <Upload size={20} /> Upload Project Files
          </h2>
          
          <div style={styles.uploadSection}>
            <div style={styles.fileInputWrapper}>
              <label htmlFor="file-upload" style={styles.fileInputLabel}>
                <FileCheck size={20} />
                Choose Files
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                style={styles.fileInput}
              />
            </div>

            {files.length > 0 && (
              <div style={styles.fileList}>
                <div style={styles.fileListHeader}>
                  {files.length} file(s) selected locally
                </div>
                {files.map((file, index) => (
                  <div key={index} style={styles.fileItem}>
                    <FileText size={16} />
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleUpload} disabled={loading || files.length === 0} style={{...styles.uploadBtn, ...(loading || files.length === 0 ? styles.btnDisabled : {})}}>
            <Upload size={18} />
            {loading && uploadStatus.includes("Uploading") ? "Uploading..." : "Upload Files"}
          </button>

          <button onClick={handleAnalyze} disabled={loading || serverFiles.length === 0} style={{...styles.analyzeBtn, ...(loading || serverFiles.length === 0 ? styles.btnDisabled : {})}}>
            <Sparkles size={18} />
            {loading && uploadStatus.includes("Analyzing") ? "Analyzing..." : "Analyze Project"}
          </button>

          {serverFiles.length > 0 && (
            <div style={styles.serverFiles}>
              <strong>Server saved files:</strong>
              <div style={styles.uploadedCount}>{uploadedCount} file(s) saved on server</div>
              {serverFiles.map((sf, idx) => (
                <div key={idx} style={styles.serverFileItem}>{sf}</div>
              ))}
            </div>
          )}

          {uploadStatus && (
            <div style={styles.uploadStatus}>
              {uploadStatus}
            </div>
          )}

          {analysisResults && !showChat && (
            <button onClick={() => setShowChat(true)} style={styles.chatBtn}>
              <MessageSquare size={18} />
              Chat with AI
            </button>
          )}

          {showChat && (
            <button onClick={() => setShowChat(false)} style={styles.chatBtn}>
              <CheckCircle size={18} />
              View Analysis
            </button>
          )}
        </aside>

        <main style={styles.mainContent}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <div style={styles.loadingText}>Processing your request...</div>
              {uploadStatus.includes("Analyzing") && (
                <div style={styles.loadingSubtext}>This may take 30-60 seconds while AI analyzes your project</div>
              )}
            </div>
          ) : showChat ? (
            <div style={styles.chatContainer}>
              <div style={styles.chatHeader}>
                <Bot size={24} />
                <h3 style={styles.chatHeaderTitle}>AI Assistant</h3>
              </div>

              <div style={styles.chatMessages}>
                {messages.map((message, index) => (
                  <div key={index} style={{...styles.chatMessage, ...(message.role === "user" ? styles.chatMessageUser : {})}}>
                    <div style={{...styles.messageAvatar, ...(message.role === "ai" ? styles.messageAvatarAi : styles.messageAvatarUser)}}>
                      {message.role === "ai" ? <Bot size={20} /> : <User size={20} />}
                    </div>
                    <div style={{...styles.messageContent, ...(message.role === "user" ? styles.messageContentUser : styles.messageContentAi)}}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={styles.chatMessage}>
                    <div style={{...styles.messageAvatar, ...styles.messageAvatarAi}}>
                      <Bot size={20} />
                    </div>
                    <div style={{...styles.messageContent, ...styles.messageContentAi}}>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.chatInputContainer}>
                <div style={styles.chatInputWrapper}>
                  <input
                    type="text"
                    placeholder="Ask me anything about your analysis..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !chatLoading && handleSendMessage()}
                    disabled={chatLoading}
                    style={styles.chatInput}
                  />
                  <button onClick={handleSendMessage} disabled={chatLoading || !chatInput.trim()} style={{...styles.sendBtn, ...(chatLoading || !chatInput.trim() ? styles.btnDisabled : {})}}>
                    <Send size={18} />
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : analysisResults ? (
            <div style={styles.analysisResults}>
              <div style={styles.analysisHeader}>
           
                <div style={styles.overallScore}>{calculateOverallScore()}/100</div>
                <p style={styles.overallScoreLabel}>Overall SDLC Compliance Score</p>
              </div>

              <div style={styles.phasesGrid}>
                {Object.entries(analysisResults.phases).map(([phaseName, phaseData]) => {
                  const IconComponent = phaseIcons[phaseName] || FileText;
                  const phaseColor = getPhaseColor(phaseName);
                  
                  return (
                    <div key={phaseName} style={{...styles.phaseCard, borderLeft: `4px solid ${phaseColor}`}}>
                      <div style={styles.phaseHeader}>
                        <div style={styles.phaseTitle}>
                          <div style={{...styles.phaseIcon, backgroundColor: phaseColor}}>
                            <IconComponent size={20} />
                          </div>
                          <h3 style={styles.phaseH3}>{phaseName.charAt(0).toUpperCase() + phaseName.slice(1)}</h3>
                        </div>
                        <div style={styles.phaseScore}>{phaseData.score || 0}/100</div>
                      </div>

                      <div style={styles.phaseDetails}>
                        {phaseData.analysis ? (
                          <div>
                            <h4 style={styles.phaseDetailsH4}>Analysis</h4>
                            <p style={styles.phaseAnalysis}>{phaseData.analysis}</p>
                          </div>
                        ) : (
                          <>
                            <div>
                              <h4 style={styles.phaseDetailsH4}>✓ Strengths</h4>
                              <ul style={styles.phaseList}>
                                {phaseData.strengths && phaseData.strengths.length > 0 ? (
                                  phaseData.strengths.map((strength, idx) => (
                                    <li key={idx} style={styles.phaseLi}>{strength}</li>
                                  ))
                                ) : (
                                  <li style={styles.phaseLi}>No strengths identified</li>
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 style={styles.phaseDetailsH4}>→ Recommendations</h4>
                              <ul style={styles.phaseList}>
                                {phaseData.recommendations && phaseData.recommendations.length > 0 ? (
                                  phaseData.recommendations.map((rec, idx) => (
                                    <li key={idx} style={styles.phaseLi}>{rec}</li>
                                  ))
                                ) : (
                                  <li style={styles.phaseLi}>No recommendations</li>
                                )}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={styles.welcomeScreen}>
              <div style={styles.welcomeIcon}>
                <Sparkles size={48} />
              </div>
              <h2 style={styles.welcomeH2}>Welcome to SDLC AI Verifier</h2>
              <p style={styles.welcomeP}>
                Upload your project files including SRS documents, design documents, implementation code, and test files. 
                Our AI will analyze each phase of the SDLC and provide detailed feedback and recommendations.
              </p>
              <div style={styles.welcomeSteps}>
                <h3 style={styles.welcomeStepsH3}>Steps to use:</h3>
                <ol style={styles.welcomeStepsOl}>
                  <li style={styles.welcomeStepsLi}>Select your project files using "Choose Files"</li>
                  <li style={styles.welcomeStepsLi}>Click "Upload Files" to send them to the server</li>
                  <li style={styles.welcomeStepsLi}>Click "Analyze Project" to run SDLC analysis</li>
                  <li style={styles.welcomeStepsLi}>Review results and chat with AI for recommendations</li>
                </ol>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function getPhaseColor(phaseName) {
  const colors = {
    requirements: '#a8c7fa',  // pastel blue
    design: '#c5b3e6',        // pastel purple
    implementation: '#a8e6cf', // pastel green
    testing: '#ffa8d4',       // pastel pink
    deployment: '#ffd4a8',    // pastel orange
    maintenance: '#a8e1fa',   // pastel cyan
  };
  return colors[phaseName] || '#a8c7fa';
}

const styles = {
 
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    maxWidth: '1400px',
    margin: '0 auto',
  
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  headerContent: {
    textAlign: 'center',
  },
  h1: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '-5px',
    color: '#a8e1fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(168, 225, 250, 0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a8e1fa',
  },
  headerSubtitle: {
    fontSize: '0.95rem',
    color: 'rgba(168, 225, 250, 0.8)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  mainLayout: {
    display: 'flex',
    gap: '1.5rem',
    flex: 1,
  },
  sidebar: {
    flex: '0 0 340px',
    backgroundColor: '#f1f3ffff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    height: 'fit-content',
  },
  sidebarTitle: {
    fontSize: '1.1rem',
    color: '#1e293b',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  uploadSection: {
    marginBottom: '1rem',
  },
  fileInputWrapper: {
    marginBottom: '0.75rem',
  },
  fileInputLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.9rem',
    backgroundColor: '#c5b3e6',
    color: '#1e293b',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  fileInput: {
    display: 'none',
  },
  fileList: {
    backgroundColor: '#002246ff',
    borderRadius: '12px',
    padding: '0.75rem',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  fileListHeader: {
    fontSize: '0.85rem',
    color: '#d6dee8ff',
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: '#334155',
  },
  uploadBtn: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#a8c7fa',
    color: '#1e293b',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    transition: 'all 0.2s',
  },
  analyzeBtn: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#a8e6cf',
    color: '#1e293b',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    transition: 'all 0.2s',
  },
  chatBtn: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#c5b3e6',
    color: '#1e293b',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
    transition: 'all 0.2s',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  serverFiles: {
    backgroundColor: '#002246ff',
    borderRadius: '12px',
    padding: '0.75rem',
    fontSize: '0.9rem',
    color: '#ffffff',
    marginTop: '1rem',
  },
  uploadedCount: {
    fontSize: '0.85rem',
    color: '#ffffff',
    marginTop: '0.25rem',
    marginBottom: '0.5rem',
  },
  serverFileItem: {
    fontSize: '0.85rem',
    padding: '0.25rem 0',
    color: '#ffffff',
  },
  uploadStatus: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#334155',
    whiteSpace: 'pre-line',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#000421ff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    minHeight: '600px',
    display: 'flex',
    gap: '1.5rem',
    
    overflowY: 'auto',     // enables vertical scroll
    maxHeight: 'calc(100vh - 120px)', 
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '400px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #a8c7fa',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    fontSize: '1.1rem',
    color: '#475569',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  welcomeScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '500px',
    textAlign: 'center',
    padding: '2rem',
  },
  welcomeIcon: {
    width: '96px',
    height: '96px',
    backgroundColor: '#a8c7fa',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    color: '#1e293b',
  },
  welcomeH2: {
    fontSize: '1.75rem',
    color: '#1e293b',
    marginBottom: '1rem',
    fontWeight: '700',
  },
  welcomeP: {
    fontSize: '1rem',
    color: '#64748b',
    maxWidth: '700px',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  welcomeSteps: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '1.5rem',
    maxWidth: '500px',
    textAlign: 'left',
  },
  welcomeStepsH3: {
    fontSize: '1.1rem',
    color: '#1e293b',
    marginBottom: '0.75rem',
    fontWeight: '600',
  },
  welcomeStepsOl: {
    paddingLeft: '1.5rem',
  },
  welcomeStepsLi: {
    color: '#475569',
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '500px',
  },
  chatHeader: {
    backgroundColor: '#c5b3e6',
    color: '#1e293b',
    padding: '1rem 1.25rem',
    borderRadius: '12px 12px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  chatHeaderTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: 0,
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
  },
  chatMessage: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  chatMessageUser: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageAvatarAi: {
    backgroundColor: '#c5b3e6',
    color: '#1e293b',
  },
  messageAvatarUser: {
    backgroundColor: '#a8e6cf',
    color: '#1e293b',
  },
  messageContent: {
    maxWidth: '70%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    lineHeight: '1.5',
  },
  messageContentAi: {
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
  },
  messageContentUser: {
    backgroundColor: '#a8e6cf',
    color: '#1e293b',
  },
  chatInputContainer: {
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    borderRadius: '0 0 12px 12px',
  },
  chatInputWrapper: {
    display: 'flex',
    gap: '0.75rem',
  },
  chatInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    padding: '0.75rem 1.25rem',
    backgroundColor: '#c5b3e6',
    color: '#1e293b',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  analysisResults: {
    animation: 'fadeIn 0.4s ease',
  },
  analysisHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  analysisTitle: {
    fontSize: '1.5rem',
    color: '#1e293b',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  overallScore: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#a8c7fa',
  },
  overallScoreLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  phasesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  phaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  phaseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  phaseTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  phaseIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1e293b',
  },
  phaseH3: {
    fontSize: '1.05rem',
    color: '#1e293b',
    fontWeight: '600',
    margin: 0,
  },
  phaseScore: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  phaseDetails: {
    maxHeight: '240px',
    overflowY: 'auto',
  },
  phaseDetailsH4: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  phaseAnalysis: {
    fontSize: '0.9rem',
    color: '#475569',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },
  phaseList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '1rem',
  },
  phaseLi: {
    fontSize: '0.9rem',
    color: '#475569',
    marginBottom: '0.5rem',
    paddingLeft: '1.25rem',
    position: 'relative',
  },
};

export default App;