'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts';
import { ChevronDown, Sparkles, Terminal, FileCode, CheckCircle2, ShieldCheck, Zap, Globe, Layers, ArrowRight } from 'lucide-react';

export function SeoContent() {
  const { t, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is JSON Formatter & SQL Query Tool?",
      a: "JSON Formatter is a free, fast online developer tool designed to format, validate, beautify, minify, and query JSON data. It features a unique SQL Query engine (powered by AlaSQL) allowing developers to filter, sort, group, and extract JSON fields using standard SQL syntax like SELECT, WHERE, and ORDER BY."
    },
    {
      q: "Is my JSON data secure when using JSONFormat.info?",
      a: "Yes! All JSON parsing, formatting, validation, and SQL querying happen 100% locally inside your web browser. Your data is never uploaded to any external server or stored anywhere."
    },
    {
      q: "How do I query JSON with SQL?",
      a: "Simply paste your JSON array or object into the editor, switch to the 'SQL Query' tab, and write standard SQL queries (e.g. SELECT * FROM ? WHERE status = 'active' ORDER BY createdAt DESC). You can immediately view results in a data table or export as raw JSON."
    },
    {
      q: "Can JSON Formatter fix broken or invalid JSON?",
      a: "Yes. Our smart JSON parser detects unquoted keys, trailing commas, single-quoted strings, or unescaped characters and automatically fixes partial JSON syntax errors so you can format and recover damaged JSON responses."
    },
    {
      q: "Can I use JSON Formatter offline?",
      a: "Yes! JSONFormat.info is built as a Progressive Web App (PWA) and can be installed directly on your desktop or mobile device for full offline capabilities. Native desktop applications are also available for Windows, macOS, and Linux."
    },
    {
      q: "What export formats are supported?",
      a: "You can convert and export JSON data into TypeScript interfaces, C# classes, Java POJOs, Python dataclasses, Go structs, Rust structs, CSV tables, XML documents, and YAML files."
    }
  ];

  return (
    <section className="seo-container">
      <div className="seo-inner">
        {/* Main SEO Header */}
        <header className="seo-header">
          <div className="seo-badge">
            <Sparkles size={14} />
            <span>Developer-First JSON Suite</span>
          </div>
          <h2 className="seo-title">
            The Ultimate Online JSON Formatter, Validator &amp; SQL Query Tool
          </h2>
          <p className="seo-subtitle">
            Format, beautify, validate, minify, and query complex JSON data online. Instant syntax highlighting, collapsible tree view, SQL filtering, and model generator in 6 languages.
          </p>
        </header>

        {/* Feature Grid */}
        <div className="seo-features-grid">
          <article className="seo-feature-card">
            <div className="seo-feature-icon">
              <Zap size={20} />
            </div>
            <h3>JSON Formatter &amp; Beautifier</h3>
            <p>
              Instantly transform unformatted, messy JSON API responses into clean, pretty-printed, indented JSON syntax with custom indentation and 20 color themes.
            </p>
          </article>

          <article className="seo-feature-card">
            <div className="seo-feature-icon">
              <CheckCircle2 size={20} />
            </div>
            <h3>Smart JSON Validator &amp; Repair</h3>
            <p>
              Detect JSON syntax errors down to line numbers. Automatically repair missing quotes, trailing commas, and unescaped characters in corrupted JSON files.
            </p>
          </article>

          <article className="seo-feature-card">
            <div className="seo-feature-icon">
              <Terminal size={20} />
            </div>
            <h3>Query JSON with SQL Syntax</h3>
            <p>
              Filter and transform JSON data using standard SQL statements (<code>SELECT</code>, <code>WHERE</code>, <code>GROUP BY</code>, <code>ORDER BY</code>). View results as interactive tables or raw JSON.
            </p>
          </article>

          <article className="seo-feature-card">
            <div className="seo-feature-icon">
              <Layers size={20} />
            </div>
            <h3>Tree View &amp; JSON Diff</h3>
            <p>
              Explore multi-level nested JSON structures with collapsible nodes. Compare two JSON objects side-by-side to highlight additions, deletions, and value modifications.
            </p>
          </article>

          <article className="seo-feature-card">
            <div className="seo-feature-icon">
              <FileCode size={20} />
            </div>
            <h3>Model Export &amp; Converter</h3>
            <p>
              Generate type-safe class models for TypeScript, C#, Java, Python, Go, and Rust. Convert JSON seamlessly to CSV, XML, YAML, and SQL INSERT queries.
            </p>
          </article>

          <article className="seo-feature-card">
            <div className="seo-feature-icon">
              <ShieldCheck size={20} />
            </div>
            <h3>100% Client-Side Privacy</h3>
            <p>
              Your security comes first. All data processing is executed entirely in your local browser environment. Zero server uploads, zero logs, 100% private.
            </p>
          </article>
        </div>

        {/* Detailed Content Section */}
        <div className="seo-body-content">
          <h3>Why Choose JSONFormat.info for Your Developer Workflow?</h3>
          <p>
            Working with REST APIs, GraphQL payloads, database exports, and configuration files requires a reliable <strong>JSON editor</strong>. Whether you need to <strong>format JSON online</strong>, <strong>validate JSON syntax</strong>, <strong>minify JSON for production</strong>, or <strong>query JSON arrays with SQL</strong>, JSONFormat.info provides an all-in-one workstation built for speed and efficiency.
          </p>
          <p>
            Unlike traditional static JSON viewers, our application combines real-time Monaco editor capabilities, tree view navigation, and full SQL engine support in a lightweight, offline-ready PWA.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="seo-faq-section">
          <h3 className="seo-faq-title">Frequently Asked Questions (FAQ)</h3>
          <div className="seo-faq-list">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`seo-faq-item ${openFaq === idx ? 'active' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="seo-faq-question">
                  <span>{faq.q}</span>
                  <ChevronDown className={`seo-faq-icon ${openFaq === idx ? 'rotated' : ''}`} size={18} />
                </div>
                {openFaq === idx && (
                  <div className="seo-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Language Footer Links for SEO */}
        <footer className="seo-lang-footer">
          <div className="seo-lang-title">
            <Globe size={14} />
            <span>Supported Languages &amp; Translations</span>
          </div>
          <div className="seo-lang-links">
            <a href="https://jsonformat.info/?lang=en" className={language === 'en' ? 'active' : ''}>English JSON Formatter</a>
            <a href="https://jsonformat.info/?lang=tr" className={language === 'tr' ? 'active' : ''}>Türkçe JSON Düzenleyici &amp; Sorgulama</a>
            <a href="https://jsonformat.info/?lang=de" className={language === 'de' ? 'active' : ''}>Deutsch JSON Formatieren</a>
            <a href="https://jsonformat.info/?lang=fr" className={language === 'fr' ? 'active' : ''}>Français Formateur JSON</a>
            <a href="https://jsonformat.info/?lang=it" className={language === 'it' ? 'active' : ''}>Italiano Formattatore JSON</a>
            <a href="https://jsonformat.info/?lang=zh" className={language === 'zh' ? 'active' : ''}>中文 JSON 格式化与 SQL 查询</a>
          </div>
          <p className="seo-copyright">
            © {new Date().getFullYear()} JSONFormat.info — Free Online JSON Tools &amp; SQL Query Workspace.
          </p>
        </footer>
      </div>
    </section>
  );
}
