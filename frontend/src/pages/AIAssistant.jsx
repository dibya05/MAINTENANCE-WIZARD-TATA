import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, FileText, History as HistoryIcon, Activity, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { sendAIMessage } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AIAssistant() {
  const [messages, setMessages] = useState([
     {
        id: 1,
        sender: 'ai',
        text: 'Hello! I am the Maintenance Wizard AI Assistant. How can I help you today?',
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
        isAnomaly: false
     }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
       id: Date.now(),
       sender: 'user',
       text: input,
       time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Pass the previous messages (excluding anomalies/system messages) as history
      const historyForAPI = messages
        .filter(m => !m.isAnomaly)
        .map(m => ({ sender: m.sender, text: m.text }));

      const { reply } = await sendAIMessage(currentInput, historyForAPI);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
        isAnomaly: false,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: `⚠️ Error: ${err.message || 'Failed to get AI response. Please try again.'}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
        isAnomaly: false,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       handleSend();
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">
      {/* Left Chat Area (70%) */}
      <div className="flex-[7] flex flex-col border-r border-border-subtle bg-background relative">
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
           
           {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 {msg.sender === 'user' ? (
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl max-w-2xl text-[14px] text-text-main">
                       {msg.text}
                    </div>
                 ) : (
                    <div className="bg-surface border border-border-subtle p-6 rounded-xl max-w-3xl w-full relative group">
                       <div className="flex items-center gap-2 mb-4 border-b border-border-subtle pb-3">
                          <Bot className="w-5 h-5 text-primary" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{msg.isAnomaly ? 'Analysis Complete' : 'AI Assistant'}</span>
                          <span className="ml-auto font-mono text-[11px] text-text-muted opacity-70">{msg.time}</span>
                       </div>

                       {msg.isAnomaly ? (
                          <div className="space-y-6">
                             {/* Status */}
                             <div>
                                <h4 className="text-[11px] font-semibold uppercase text-text-muted tracking-wider mb-2">Status</h4>
                                <div className="inline-flex items-center gap-2 bg-critical/10 border border-critical/30 px-3 py-1.5 rounded-full">
                                   <span className="w-2 h-2 rounded-full bg-critical"></span>
                                   <span className="text-[13px] font-semibold text-critical">Critical Anomaly Confirmed</span>
                                </div>
                                <p className="mt-2 text-[14px] text-text-muted">High-frequency vibration spike exceeding safe operational thresholds.</p>
                             </div>

                             {/* Evidence */}
                             <div>
                                <h4 className="text-[11px] font-semibold uppercase text-text-muted tracking-wider mb-2">Evidence</h4>
                                <ul className="list-disc pl-4 space-y-2 text-[14px] text-text-muted marker:text-text-muted/50">
                                   <li>Axial vibration at 14.2 mm/s (Threshold: 8.5 mm/s) on <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] border border-info/50 bg-background text-text-main mx-1">TAG · 14:01 · [P-102]</span> bearing housing.</li>
                                   <li>Acoustic emission signature matches inner race bearing fault pattern documented in <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] border border-info/50 bg-background text-text-main mx-1">DOC · V1.2 · DOC-882</span>.</li>
                                   <li>Temperature rising 2.5°C/hr over last 4 hours.</li>
                                </ul>
                             </div>

                             {/* Contributors */}
                             <div>
                                <h4 className="text-[11px] font-semibold uppercase text-text-muted tracking-wider mb-2">Contributors</h4>
                                <p className="text-[14px] text-text-muted mb-3">Likely cause is lubrication starvation leading to accelerated bearing wear, consistent with last maintenance log.</p>
                                <div className="space-y-2 max-w-md">
                                   <div className="flex items-center gap-3">
                                      <span className="text-[12px] text-text-muted w-24">Lube Level</span>
                                      <div className="flex-1 h-2 bg-background border border-border-subtle rounded-full overflow-hidden">
                                         <div className="h-full bg-warning w-[15%]"></div>
                                      </div>
                                      <span className="font-mono text-[11px] text-warning">15%</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <span className="text-[12px] text-text-muted w-24">Vibration</span>
                                      <div className="flex-1 h-2 bg-background border border-border-subtle rounded-full overflow-hidden">
                                         <div className="h-full bg-critical w-[92%]"></div>
                                      </div>
                                      <span className="font-mono text-[11px] text-critical">92%</span>
                                   </div>
                                </div>
                             </div>

                             {/* Recommendation */}
                             <div className="bg-background/50 p-4 rounded-lg border-y border-r border-border-subtle border-l-4 border-l-info">
                                <h4 className="text-[11px] font-semibold uppercase text-info tracking-wider mb-2">Recommendation</h4>
                                <p className="text-[14px] text-text-main mb-4">Schedule immediate shutdown of <span className="font-mono text-info">[P-102]</span> and switch to redundant system. Inspect and replace drive-end bearing. Top up lubrication system.</p>
                                <button className="bg-primary text-white text-[13px] font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                                   Generate Work Order
                                </button>
                             </div>
                          </div>
                       ) : (
                          <div className="text-[14px] text-text-main markdown-body">
                             <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                   h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-5 mb-3 text-text-main border-b border-border-subtle pb-2" {...props} />,
                                   h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-5 mb-2 text-primary" {...props} />,
                                   h3: ({node, ...props}) => <h3 className="text-[15px] font-bold mt-4 mb-2 text-text-main" {...props} />,
                                   p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                                   ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1.5 marker:text-primary" {...props} />,
                                   ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 marker:text-primary font-mono text-text-muted" {...props} />,
                                   li: ({node, ...props}) => <li className="text-text-muted" {...props} />,
                                   strong: ({node, ...props}) => <strong className="font-semibold text-text-main" {...props} />,
                                   table: ({node, ...props}) => <div className="overflow-x-auto mb-5 rounded-lg border border-border-subtle"><table className="w-full text-left border-collapse text-[13px]" {...props} /></div>,
                                   thead: ({node, ...props}) => <thead className="bg-background/80 border-b border-border-subtle" {...props} />,
                                   th: ({node, ...props}) => <th className="p-3 font-semibold uppercase tracking-wider text-[11px] text-text-muted" {...props} />,
                                   td: ({node, ...props}) => <td className="p-3 border-b border-border-subtle text-text-main" {...props} />,
                                   blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-info pl-4 py-2 mb-4 bg-info/5 italic text-text-muted rounded-r-lg" {...props} />,
                                   code: ({node, inline, className, children, ...props}) => {
                                      const match = /language-(\w+)/.exec(className || '');
                                      return inline ? (
                                         <code className="bg-background border border-border-subtle rounded-md px-1.5 py-0.5 font-mono text-[12px] text-primary" {...props}>{children}</code>
                                      ) : (
                                         <div className="relative mb-4">
                                            <div className="absolute top-0 right-0 bg-surface px-2 py-1 text-[10px] font-mono text-text-muted rounded-bl-lg border-b border-l border-border-subtle">{match?.[1] || 'code'}</div>
                                            <pre className="bg-background border border-border-subtle p-4 pt-8 rounded-lg overflow-x-auto"><code className="font-mono text-[12px] text-text-main" {...props}>{children}</code></pre>
                                         </div>
                                      );
                                   },
                                   hr: ({node, ...props}) => <hr className="border-border-subtle my-5 border-dashed" {...props} />,
                                   a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />
                                }}
                             >
                                {msg.text}
                             </ReactMarkdown>
                          </div>
                       )}

                       {/* Feedback Controls */}
                       <div className="absolute -right-12 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 bg-surface border border-border-subtle rounded hover:bg-white/5 text-text-muted hover:text-success transition-colors">
                             <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 bg-surface border border-border-subtle rounded hover:bg-white/5 text-text-muted hover:text-critical transition-colors">
                             <ThumbsDown className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           ))}

           {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-surface border border-border-subtle p-4 rounded-xl flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <div className="flex gap-1 ml-2">
                       <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                       <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                       <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                 </div>
              </div>
           )}
           <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-surface border-t border-border-subtle shrink-0">
           <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
              <SuggestionChip label="Summarize P-102 Logs" onClick={() => { setInput("Summarize P-102 Logs"); }} />
              <SuggestionChip label="Check Sector 4 Power" onClick={() => { setInput("Check Sector 4 Power"); }} />
              <SuggestionChip label="View Maintenance Schedule" onClick={() => { setInput("View Maintenance Schedule"); }} />
           </div>
           <div className="relative">
              <textarea 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={handleKeyDown}
                 className="w-full bg-background border border-border-subtle rounded-xl p-4 pr-24 text-[14px] text-text-main focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none h-16"
                 placeholder="Ask about equipment status, analyze anomalies, or generate reports..."
              ></textarea>
              <div className="absolute right-2 bottom-2 flex gap-1">
                 <button className="p-2 text-text-muted hover:text-primary transition-colors rounded">
                    <Paperclip className="w-4 h-4" />
                 </button>
                 <button onClick={handleSend} disabled={!input.trim()} className="p-2 bg-primary text-white hover:bg-primary-hover transition-colors rounded-lg disabled:opacity-50">
                    <Send className="w-4 h-4" />
                 </button>
              </div>
           </div>
           <p className="text-[10px] text-text-muted text-center mt-3 opacity-70">AI may produce inaccurate information. Please verify critical data.</p>
        </div>
      </div>

      {/* Right Panel (30%) */}
      <div className="flex-[3] bg-surface flex flex-col min-w-[300px]">
        {/* Tool Activity */}
        <div className="flex-1 flex flex-col border-b border-border-subtle overflow-hidden">
           <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-background/50 shrink-0">
              <h3 className="text-[16px] font-semibold text-text-main">Tool Activity</h3>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
           </div>
           <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
              <TimelineItem 
                 icon={<Activity className="w-3 h-3" />}
                 time="14:02:41"
                 content={<>Scanning 4 sensor streams for <span className="text-primary font-mono">[P-102]</span>...</>}
              />
              <TimelineItem 
                 icon={<DatabaseIcon />}
                 time="14:02:42"
                 content={<>Querying historical maintenance records (Last 90 days).</>}
              />
              <TimelineItem 
                 icon={<FileText className="w-3 h-3" />}
                 time="14:02:44"
                 content="Consulting Pump Manual Rev B for acoustic signatures."
                 active
              />
           </div>
        </div>

        {/* Source Documents */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background/30">
           <div className="p-5 border-b border-border-subtle shrink-0">
              <h3 className="text-[16px] font-semibold text-text-main">Source Documents</h3>
           </div>
           <div className="p-5 overflow-y-auto no-scrollbar space-y-3">
              <DocCard 
                 title="Pump_P102_Manual.pdf" 
                 icon={<FileText className="w-4 h-4 text-info" />} 
                 version="v2.1"
                 snippet="Inner race bearing faults typically present as high-frequency acoustic emissions in the 20-40 kHz range..."
                 relevance={95}
              />
              <DocCard 
                 title="Maint_Log_91A.txt" 
                 icon={<HistoryIcon className="w-4 h-4 text-primary" />} 
                 version="v1.0"
                 snippet="Routine inspection noted slightly low lubrication reservoir. Topped up 200ml. No visible leaks detected..."
                 relevance={82}
                 relevanceColor="bg-warning"
                 relevanceText="text-warning"
              />
              <DocCard 
                 title="Telemetry_Stream.csv" 
                 icon={<Activity className="w-4 h-4 text-warning" />} 
                 version="LIVE"
                 snippet="Timestamp, SensorID, Value, Unit | 14:00:01, VIB-Z, 14.1, mm/s | 14:00:02, VIB-Z, 14.2, mm/s..."
                 relevance={98}
              />
           </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionChip({ label, onClick }) {
   return (
      <button onClick={onClick} className="text-[10px] font-semibold uppercase tracking-wider border border-border-subtle bg-background hover:bg-white/5 px-3 py-1.5 rounded-full text-text-muted whitespace-nowrap transition-colors">
         {label}
      </button>
   )
}

function TimelineItem({ icon, time, content, active }) {
   return (
      <div className="flex gap-3">
         <div className="flex flex-col items-center">
            <div className="w-px h-full bg-border-subtle mt-4"></div>
         </div>
         <div className="flex-1 pb-2">
            <div className="flex items-center justify-between mb-1.5">
               <div className="flex items-center gap-1.5 text-text-muted">
                  {icon}
                  <span className="font-mono text-[10px]">{time}</span>
               </div>
               <Eye className="w-3 h-3 text-success opacity-70" />
            </div>
            <div className={`bg-background border border-border-subtle p-3 rounded-xl text-[12px] text-text-main ${active ? 'border-l-2 border-l-info' : ''}`}>
               {content}
            </div>
         </div>
      </div>
   )
}

function DocCard({ title, icon, version, snippet, relevance, relevanceColor = 'bg-success', relevanceText = 'text-success' }) {
   return (
      <div className="p-3 bg-background border border-border-subtle rounded-xl hover:border-primary/30 transition-colors cursor-pointer group">
         <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
               {icon}
               <span className="font-mono text-[12px] text-text-main group-hover:text-primary transition-colors">{title}</span>
            </div>
            <span className="text-[9px] font-mono bg-surface px-1.5 py-0.5 rounded text-text-muted border border-border-subtle">{version}</span>
         </div>
         <p className="text-[11px] text-text-muted line-clamp-2 mb-3 leading-relaxed">{snippet}</p>
         <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
               <div className={`h-full ${relevanceColor}`} style={{ width: `${relevance}%` }}></div>
            </div>
            <span className={`text-[9px] font-mono ${relevanceText}`}>{relevance}%</span>
         </div>
      </div>
   )
}

function DatabaseIcon() {
   return (
      <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
   )
}
