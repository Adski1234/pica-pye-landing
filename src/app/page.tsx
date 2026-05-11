"use client";

import React, { useState, useActionState, useEffect } from "react";
import Image from "next/image";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessInput, setBusinessInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [typedLine1, setTypedLine1] = useState("");
  const [typedLine2, setTypedLine2] = useState("");
  const [dots, setDots] = useState("");

  useEffect(() => {
    const L1 = "DIGITAL";
    const L2 = "TRANSFORMATION";
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      while (!cancelled) {
        for (let i = 1; i <= L1.length; i++) {
          if (cancelled) return;
          setTypedLine1(L1.slice(0, i));
          await sleep(150);
        }
        await sleep(250);
        for (let i = 1; i <= L2.length; i++) {
          if (cancelled) return;
          setTypedLine2(L2.slice(0, i));
          await sleep(150);
        }
        await sleep(250);
        for (let d = 1; d <= 3; d++) {
          if (cancelled) return;
          setDots(".".repeat(d));
          await sleep(400);
        }
        await sleep(800);
        if (cancelled) return;
        setTypedLine1("");
        setTypedLine2("");
        setDots("");
        await sleep(500);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  const [contactState, contactAction, contactPending] = useActionState(
    async (_prev: string, formData: FormData) => {
      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message"),
          }),
        });
        return "sent";
      } catch {
        return "error";
      }
    },
    "idle"
  );

  const openAuditModal = () => setIsModalOpen(true);
  const closeAuditModal = () => {
    setIsModalOpen(false);
    setAuditResult("");
    setErrorMsg("");
    setBusinessInput("");
  };

  const handleModalBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === "auditModal") {
      closeAuditModal();
    }
  };

  const generateAudit = async () => {
    if (!businessInput.trim()) {
      setErrorMsg("Please describe your business and bottleneck first.");
      return;
    }

    setErrorMsg("");
    setAuditResult("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInput }),
      });

      if (!res.ok) throw new Error("Request failed");

      const { html } = await res.json();
      setAuditResult(html ?? "Unable to generate audit at this time.");
    } catch {
      setErrorMsg(
        "An error occurred while connecting to the PicaPye AI Engine. Please check your connection and try again",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('[https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap](https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap)');

        :root {
            --bg-color: #eaeaea;
            --grid-line: #a3a3a3;
            --text-color: #1a1a1a;
            --brand-purple: #7e22ce; 
            --brand-cyan: #06b6d4;   
            --font-mono: 'Space Mono', monospace;
            --font-sans: 'Space Grotesk', sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: var(--font-mono);
            min-height: 100vh;
            margin: 0;
            padding: 0;
        }

        .wireframe-grid {
            width: 100%;
            display: grid;
            grid-template-columns: 1.2fr 1fr 1.2fr 1fr 60px;
            border-top: 1px solid var(--grid-line);
            border-left: 1px solid var(--grid-line);
            background: var(--bg-color);
            box-shadow: 20px 20px 60px rgba(0,0,0,0.05);
        }

        .cell {
            border-bottom: 1px solid var(--grid-line);
            border-right: 1px solid var(--grid-line);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .corner-dot {
            width: 6px;
            height: 6px;
            background-color: var(--brand-purple);
            position: absolute;
        }
        .corner-dot.tl { top: 15px; left: 15px; }
        .corner-dot.tr { top: 15px; right: 15px; }
        .corner-dot.bl { bottom: 15px; left: 15px; }
        .corner-dot.br { bottom: 15px; right: 15px; }

        .crosshair {
            position: absolute;
            color: var(--grid-line);
            font-size: 10px;
            pointer-events: none;
        }
        .crosshair.tl { top: 5px; left: 5px; }
        .crosshair.tr { top: 5px; right: 5px; }
        .crosshair.bl { bottom: 5px; left: 5px; }
        .crosshair.br { bottom: 5px; right: 5px; }

        .font-sans-bold { font-family: var(--font-sans); font-weight: 900; }
        .font-sans-reg { font-family: var(--font-sans); font-weight: 700; }
        
        .huge-text {
            font-size: clamp(2rem, 7vw, 8rem);
            line-height: 0.85;
            letter-spacing: -0.05em;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            color: var(--text-color);
        }

        .btn-primary {
            background-color: var(--brand-purple);
            color: white;
            font-family: var(--font-sans);
            font-weight: 700;
            text-transform: uppercase;
            transition: all 0.2s ease-in-out;
            border: 2px solid transparent;
            cursor: pointer;
        }
        .btn-primary:hover {
            background-color: transparent;
            color: var(--brand-purple);
            border-color: var(--brand-purple);
        }

        .header-nav ul {
            display: flex;
            gap: 2rem;
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 700;
        }
        .header-nav a { text-decoration: none; color: inherit; transition: color 0.2s; }
        .header-nav a:hover { color: var(--brand-cyan); }

        .sidebar-icons {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            color: #555;
            font-size: 1.2rem;
        }
        
        .sidebar-icons svg {
            width: 20px; height: 20px;
            cursor: pointer;
            transition: color 0.2s;
        }
        .sidebar-icons svg:hover { color: var(--brand-cyan); }

        .ai-core-graphic {
            width: 220px;
            height: 220px;
            background: linear-gradient(135deg, #f5f5f5 0%, #d4d4d4 100%);
            border-radius: 30px;
            border: 8px solid white;
            box-shadow: inset 10px 10px 20px rgba(0,0,0,0.05), 20px 20px 40px rgba(0,0,0,0.1);
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
        }

        .ai-core-inner {
            width: 140px;
            height: 140px;
            background-color: #111;
            border-radius: 20px;
            border: 4px solid var(--brand-purple);
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .ai-eyes {
            display: flex;
            gap: 20px;
        }

        .ai-eye {
            width: 16px;
            height: 16px;
            background-color: var(--brand-cyan);
            border-radius: 50%;
            box-shadow: 0 0 15px var(--brand-cyan);
            animation: blink 4s infinite;
        }

        .ai-grid-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            pointer-events: none;
        }

        @keyframes blink {
            0%, 96%, 98% { transform: scaleY(1); }
            97% { transform: scaleY(0.1); }
        }

        .dark-box {
            background-color: #050505;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            position: relative;
        }

        @media (max-width: 1024px) {
            .wireframe-grid { grid-template-columns: 1fr; }
            .hide-mobile { display: none !important; }
            .col-span-4, .col-span-2, .col-span-3 { grid-column: span 1 / span 1 !important; }
            .huge-text { font-size: 2.5rem; white-space: normal; word-break: break-word;}
        }

        .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 50;
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background: var(--bg-color);
            width: 90%;
            max-width: 600px;
            border: 2px solid var(--grid-line);
            padding: 2.5rem;
            position: relative;
            box-shadow: 20px 20px 0px rgba(126, 34, 206, 0.2);
            max-height: 90vh;
            overflow-y: auto;
        }

        .close-modal {
            position: absolute;
            top: 15px; right: 20px;
            cursor: pointer;
            font-size: 1.5rem;
            font-family: var(--font-sans);
            font-weight: 900;
            color: var(--text-color);
            transition: color 0.2s;
        }
        .close-modal:hover { color: var(--brand-purple); }

        .audit-input {
            width: 100%;
            padding: 1rem;
            background: #fff;
            border: 1px solid var(--grid-line);
            font-family: var(--font-mono);
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            resize: vertical;
            outline: none;
        }
        .audit-input:focus { border-color: var(--brand-purple); }

        .audit-result {
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: #fff;
            border: 1px solid var(--brand-cyan);
            border-left: 4px solid var(--brand-cyan);
            font-size: 0.9rem;
            line-height: 1.6;
        }
        .audit-result h3 {
            font-family: var(--font-sans);
            font-weight: 700;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            color: var(--brand-purple);
        }
        .audit-result ul { padding-left: 1.5rem; margin-bottom: 1rem; }
        .audit-result li { margin-bottom: 0.5rem; }

        .loading-spinner {
            margin-top: 1.5rem;
            font-weight: bold;
            color: var(--brand-purple);
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
      `}</style>

      <div className="wireframe-grid">
        {/* ROW 1: Header */}
        <div className="cell p-0 relative overflow-hidden">
          <Image
            src="/PicaPyeLogoSVG.png"
            alt="PicaPye"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <div className="cell col-span-2 header-nav px-8 hide-mobile">
          <ul>
            <li>
              <a href="#">Our Services</a>
            </li>
            <li>
              <a href="#">SMEs</a>
            </li>
            <li>
              <a href="#">Voluntary Orgs</a>
            </li>
            <li>
              <a href="#">Case Studies</a>
            </li>
            <li>
              <a href="#">AI Training</a>
            </li>
          </ul>
        </div>

        <div className="cell px-6 flex flex-row justify-between items-center text-xs uppercase font-bold hide-mobile">
          <span className="flex items-center gap-2">
            <span className="text-purple-600">::</span> Free Audit
          </span>
          <button
            className="btn-primary px-5 py-2 rounded"
            onClick={openAuditModal}
          >
            Get Instant Audit ✨
          </button>
        </div>

        <div className="cell flex items-center justify-center text-gray-400 hide-mobile">
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <path d="m9 9 6 6" />
            <path d="m15 9-6 6" />
          </svg>
        </div>

        {/* ROW 2: HUGE TITLE */}
        <div
          className="cell col-span-4 p-8 overflow-hidden relative"
          style={{ gridColumn: "1 / 5" }}
        >
          <div className="corner-dot tl"></div>
          <div className="corner-dot tr"></div>
          <div className="corner-dot bl"></div>
          <div className="corner-dot br"></div>

          <div className="font-sans-bold huge-text">{typedLine1 || " "}</div>
          <div className="font-sans-bold huge-text">{typedLine2 || " "}{dots}</div>

          <div className="absolute bottom-4 left-8 text-xs font-bold uppercase tracking-widest text-gray-500 flex gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 inline-block"></span>{" "}
              EMPOWERING SMEs
            </span>
            <span>VOLUNTARY ORGANISATIONS</span>
          </div>
        </div>

        {/* Right Sidebar (Spans rows) */}
        <div
          className="cell sidebar-icons"
          style={{ gridColumn: "5 / 6", gridRow: "2 / 5" }}
        >
          <div className="mt-4 mb-4">
            <svg
              xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        {/* ROW 3: Hero Content & Graphics */}
        <div
          className="cell p-8 flex flex-col justify-center items-start gap-8"
          style={{ gridColumn: "1 / 2" }}
        >
          <p className="text-sm leading-relaxed max-w-[280px]">
            Guiding SMEs and Voluntary Organisations — transforming legacy
            workflows into visionary digital powerhouses through local AI and
            strategic marketing.
          </p>
          <button
            className="btn-primary w-full py-4 text-xs tracking-wider rounded shadow-lg"
            onClick={openAuditModal}
          >
            Generate AI Digital Audit ✨
          </button>
        </div>

        {/* Main Graphic (AI Core) */}
        <div
          className="cell col-span-2 relative p-12 overflow-hidden"
          style={{
            gridColumn: "2 / 4",
            backgroundImage:
              "radial-gradient(circle at center, #fdfdfd 0%, #eaeaea 100%)",
          }}
        >
          <div className="crosshair tl">+</div>
          <div className="crosshair tr">+</div>
          <div className="crosshair bl">+</div>
          <div className="crosshair br">+</div>

          <div className="ai-core-graphic">
            <div className="ai-core-inner">
              <div className="ai-grid-overlay"></div>
              <div className="ai-eyes">
                <div className="ai-eye"></div>
                <div className="ai-eye"></div>
              </div>
            </div>
            <div className="absolute w-6 h-12 bg-gray-300 rounded-l-md -right-6 top-1/2 -translate-y-1/2"></div>
            <div className="absolute w-6 h-12 bg-gray-300 rounded-r-md -left-6 top-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="cell p-6 flex flex-col gap-3" style={{ gridColumn: "4 / 5" }}>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Get in touch</p>
          {contactState === "sent" ? (
            <p className="text-sm text-green-600">Message sent — we&apos;ll be in touch.</p>
          ) : (
            <form action={contactAction} autoComplete="off" className="flex flex-col gap-2">
              <input
                name="name"
                type="text"
                required
                placeholder="Name"
                className="bg-transparent border border-gray-400 rounded px-3 py-1.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-gray-700"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="bg-transparent border border-gray-400 rounded px-3 py-1.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-gray-700"
              />
              <textarea
                name="message"
                required
                rows={3}
                placeholder="Message"
                className="bg-transparent border border-gray-400 rounded px-3 py-1.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-gray-700 resize-none"
              />
              {contactState === "error" && (
                <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
              )}
              <button
                type="submit"
                disabled={contactPending}
                className="self-start px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-gray-500 text-black hover:border-black transition-colors disabled:opacity-40"
              >
                {contactPending ? "Sending…" : "Send"}
              </button>
            </form>
          )}
        </div>

        {/* ROW 4: Services Bar */}
        <div
          className="cell p-6 text-xs font-bold uppercase tracking-wider text-gray-500"
          style={{ gridColumn: "1 / 2" }}
        >
          Core Services:
        </div>

        <div
          className="cell p-6 flex flex-row items-center gap-3"
          style={{ gridColumn: "2 / 3" }}
        >
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-cyan-500"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          <span className="font-sans-reg text-lg tracking-tight text-black">
            AI Integration & Local LLMs
          </span>
        </div>

        <div
          className="cell p-6 flex flex-row items-center gap-3"
          style={{ gridColumn: "3 / 4" }}
        >
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-purple-600"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
          <span className="font-sans-reg text-lg tracking-tight text-black">
            GDPR AI Audits & Staff Training
          </span>
        </div>

        <div
          className="cell p-6 flex flex-row items-center gap-3"
          style={{ gridColumn: "4 / 5" }}
        >
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-cyan-500"
          >
            <path d="M2 12h4l3-9 5 18 3-9h5" />
          </svg>
          <span className="font-sans-reg text-lg tracking-tight text-black">
            Workflow Optimisation & SEO
          </span>
        </div>
      </div>

      {/* AI Audit Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          id="auditModal"
          onClick={handleModalBackgroundClick}
        >
          <div className="modal-content">
            <div className="close-modal" onClick={closeAuditModal}>
              ✕
            </div>
            <h2 className="font-sans-bold text-3xl mb-2 text-black">
              Instant AI Digital Audit
            </h2>
            <p className="text-sm text-gray-600 font-mono mt-2">
              Describe your organization and your biggest daily bottleneck. Our
              AI will instantly generate a tailored 3-step digital
              transformation plan to show you what we can do.
            </p>

            <textarea
              className="audit-input"
              rows={4}
              placeholder="E.g., We are a local charity. We spend hours every week manually copying data from emails into our volunteer database spreadsheet..."
              value={businessInput}
              onChange={(e) => setBusinessInput(e.target.value)}
            />

            <button
              className="btn-primary w-full py-3 mt-2 text-sm"
              onClick={generateAudit}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze & Strategize ✨"}
            </button>

            {errorMsg && (
              <p
                style={{
                  color: "var(--brand-purple)",
                  fontWeight: "bold",
                  marginTop: "1rem",
                }}
              >
                {errorMsg}
              </p>
            )}

            {isLoading && (
              <div className="loading-spinner">
                ✨ PicaPye Engine is analyzing your workflow...
              </div>
            )}

            {auditResult && !isLoading && (
              <div className="audit-result">
                <p className="font-sans-bold text-lg mb-4 text-black">
                  Here is your tailored PicaPye Strategy:
                </p>
                <div dangerouslySetInnerHTML={{ __html: auditResult }} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
