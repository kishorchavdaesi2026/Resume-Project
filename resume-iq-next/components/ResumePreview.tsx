"use client";

import React from "react";
import { Resume } from "../types";
import { Mail, Phone, Globe, MapPin, ExternalLink } from "lucide-react";

interface ResumePreviewProps {
  resume: Resume;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  const {
    templateId,
    themeColor,
    fontFamily,
    fontSize,
    personalInfo,
    summary,
    experience,
    education,
    projects,
    skills,
    languages,
    certificates,
    achievements
  } = resume;

  // Font size multiplier mapping
  const sizeClasses = {
    sm: "text-[12px] leading-relaxed",
    md: "text-[14px] leading-relaxed",
    lg: "text-[16px] leading-relaxed"
  };

  const bodyFontSize = sizeClasses[fontSize || "md"];

  // Helper styles based on chosen fontFamily variables
  const fontStyle = {
    fontFamily: fontFamily || "var(--font-inter)"
  };

  const textThemeColor = { color: themeColor };
  const bgThemeColor = { backgroundColor: themeColor };
  const borderThemeColor = { borderColor: themeColor };

  // ----------------------------------------------------
  // TEMPLATE 1: ATS CLASSIC (Clean, Single Column)
  // ----------------------------------------------------
  const renderATSClassic = () => (
    <div className="flex flex-col gap-5 text-black">
      {/* Header */}
      <div className="text-center flex flex-col gap-1.5 border-b pb-4 border-slate-200">
        <h1 className="text-3xl font-black tracking-tight" style={fontStyle}>
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <h2 className="text-sm uppercase tracking-wider font-bold" style={{ ...fontStyle, ...textThemeColor }}>
          {personalInfo.title}
        </h2>
        
        {/* Contact Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-650 mt-1">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <a href={personalInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="flex flex-col gap-1">
          <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-300 pb-1" style={textThemeColor}>
            Professional Summary
          </h3>
          <p className={bodyFontSize}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-300 pb-1" style={textThemeColor}>
            Work History
          </h3>
          <div className="flex flex-col gap-4">
            {experience.map((exp) => (
              <div key={exp.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-start text-xs font-bold">
                  <div className="flex flex-wrap items-baseline gap-x-1">
                    <span className="text-sm font-black">{exp.position}</span>
                    <span className="text-slate-500 font-normal">at</span>
                    <span className="text-slate-800">{exp.company}</span>
                  </div>
                  <div className="text-slate-500 text-right shrink-0">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    <span className="block font-normal text-[10px]">{exp.location}</span>
                  </div>
                </div>
                <p className={`${bodyFontSize} text-slate-700 whitespace-pre-line`}>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-300 pb-1" style={textThemeColor}>
            Education
          </h3>
          <div className="flex flex-col gap-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start text-xs">
                <div>
                  <span className="font-black text-sm">{edu.degree} in {edu.fieldOfStudy}</span>
                  <span className="block text-slate-650 font-semibold">{edu.school}</span>
                </div>
                <div className="text-slate-500 text-right shrink-0 font-bold">
                  {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-300 pb-1" style={textThemeColor}>
            Key Projects
          </h3>
          <div className="flex flex-col gap-3">
            {projects.map((proj) => (
              <div key={proj.id} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-sm font-black flex items-center gap-1">
                    {proj.name}
                    {proj.url && <ExternalLink className="w-3 h-3 text-slate-450" />}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{proj.technologies.join(", ")}</span>
                </div>
                <p className={`${bodyFontSize} text-slate-750`}>{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-300 pb-1" style={textThemeColor}>
            Expertise & Skills
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            {skills.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <span className="font-semibold text-slate-800">{s.name}</span>
                <span className="text-[10px] text-slate-400">({s.level})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certs & Languages Grid */}
      {(certificates.length > 0 || languages.length > 0) && (
        <div className="grid grid-cols-2 gap-6 mt-1">
          {certificates.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-300 pb-1" style={textThemeColor}>
                Certifications
              </h3>
              <ul className="flex flex-col gap-1 text-xs">
                {certificates.map((c) => (
                  <li key={c.id} className="flex justify-between">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-slate-400">{c.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {languages.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-300 pb-1" style={textThemeColor}>
                Languages
              </h3>
              <ul className="flex flex-col gap-1 text-xs">
                {languages.map((l) => (
                  <li key={l.id} className="flex justify-between">
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-slate-500">({l.proficiency})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ----------------------------------------------------
  // TEMPLATE 2: MODERN TECH (Dual Column sidebar layout)
  // ----------------------------------------------------
  const renderModernTech = () => (
    <div className="grid grid-cols-12 gap-8 text-black min-h-[250mm]">
      {/* Left Accent Sidebar (4 cols) */}
      <div className="col-span-4 border-r border-slate-200 pr-6 flex flex-col gap-6">
        {/* Name & Contact */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black leading-tight" style={fontStyle}>
            {personalInfo.firstName}<br />{personalInfo.lastName}
          </h1>
          <h2 className="text-xs uppercase font-bold tracking-wider" style={textThemeColor}>
            {personalInfo.title}
          </h2>
          
          <div className="flex flex-col gap-2 text-xs text-slate-650 mt-4">
            {personalInfo.email && (
              <span className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {personalInfo.location}
              </span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {personalInfo.website.replace(/^https?:\/\//, "")}
              </span>
            )}
          </div>
        </div>

        {/* Skills sidebar */}
        {skills.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-wider font-extrabold pb-1 border-b border-slate-200" style={textThemeColor}>
              Skills
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              {skills.map((s) => (
                <div key={s.id} className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{s.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                    {s.level === "Expert" ? "L3" : s.level === "Intermediate" ? "L2" : "L1"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages sidebar */}
        {languages.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-wider font-extrabold pb-1 border-b border-slate-200" style={textThemeColor}>
              Languages
            </h3>
            <div className="flex flex-col gap-1.5 text-xs">
              {languages.map((l) => (
                <div key={l.id} className="flex flex-col">
                  <span className="font-semibold">{l.name}</span>
                  <span className="text-[10px] text-slate-500">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications sidebar */}
        {certificates.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-wider font-extrabold pb-1 border-b border-slate-200" style={textThemeColor}>
              Certifications
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              {certificates.map((c) => (
                <div key={c.id} className="flex flex-col">
                  <span className="font-semibold text-slate-850">{c.name}</span>
                  <span className="text-[10px] text-slate-400">{c.issuer} ({c.date})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content Pane (8 cols) */}
      <div className="col-span-8 flex flex-col gap-6">
        {/* Summary */}
        {summary && (
          <div className="flex flex-col gap-1.5">
            <p className={`${bodyFontSize} text-slate-700 italic leading-relaxed`}>{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-250 pb-1" style={{ ...textThemeColor, ...borderThemeColor }}>
              Professional Experience
            </h3>
            <div className="flex flex-col gap-5">
              {experience.map((exp) => (
                <div key={exp.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <div className="flex flex-wrap items-baseline gap-x-1">
                      <span className="text-sm font-black text-slate-800">{exp.position}</span>
                      <span className="text-slate-450 font-normal">@</span>
                      <span className="font-bold text-slate-700">{exp.company}</span>
                    </div>
                    <span className="text-slate-500 shrink-0 font-semibold">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p className={`${bodyFontSize} text-slate-650 whitespace-pre-line`}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-250 pb-1" style={{ ...textThemeColor, ...borderThemeColor }}>
              Select Projects
            </h3>
            <div className="flex flex-col gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-sm font-black text-slate-800">{proj.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{proj.technologies.join(", ")}</span>
                  </div>
                  <p className={`${bodyFontSize} text-slate-650`}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-widest font-black border-b border-slate-250 pb-1" style={{ ...textThemeColor, ...borderThemeColor }}>
              Education
            </h3>
            <div className="flex flex-col gap-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-extrabold text-sm text-slate-800">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="block text-slate-500">{edu.school}</span>
                  </div>
                  <span className="text-slate-500 font-bold shrink-0">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ----------------------------------------------------
  // TEMPLATE 3: CREATIVE GLASS (Accent Lines & Badges)
  // ----------------------------------------------------
  const renderCreativeGlass = () => (
    <div className="flex flex-col gap-6 text-black">
      {/* Top Banner Accent */}
      <div className="h-2 w-full rounded-t-xl" style={bgThemeColor} />
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-5 border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex flex-wrap items-center gap-x-1.5" style={fontStyle}>
            <span>{personalInfo.firstName}</span>
            <span style={textThemeColor}>{personalInfo.lastName}</span>
          </h1>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            {personalInfo.title}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
          {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.email}</span>}
          {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.phone}</span>}
          {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.location}</span>}
          {personalInfo.website && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.website.replace(/^https?:\/\//, "")}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-extrabold tracking-wide uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full" style={bgThemeColor} />
            Summary
          </h3>
          <p className={`${bodyFontSize} text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100`}>
            {summary}
          </p>
        </div>
      )}

      {/* Two Column details */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Side (8 cols) */}
        <div className="col-span-8 flex flex-col gap-6">
          
          {/* Work History */}
          {experience.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold tracking-wide uppercase flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full" style={bgThemeColor} />
                Work History
              </h3>
              <div className="flex flex-col gap-5">
                {experience.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-slate-200">
                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border bg-white" style={borderThemeColor} />
                    <div className="flex justify-between items-baseline text-xs mb-1">
                      <div className="flex flex-wrap items-baseline gap-x-1">
                        <span className="text-sm font-black text-slate-800">{exp.position}</span>
                        <span className="text-slate-500 font-normal">at</span>
                        <span className="font-extrabold text-slate-700">{exp.company}</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500 shrink-0">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className={`${bodyFontSize} text-slate-650 whitespace-pre-line`}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Projects */}
          {projects.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold tracking-wide uppercase flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full" style={bgThemeColor} />
                Projects
              </h3>
              <div className="flex flex-col gap-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-sm font-black text-slate-850">{proj.name}</span>
                      <span className="text-[9px] bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded font-bold">{proj.technologies.join(", ")}</span>
                    </div>
                    <p className={`${bodyFontSize} text-slate-650`}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Small Side (4 cols) */}
        <div className="col-span-4 flex flex-col gap-6">
          
          {/* Skills Grid */}
          {skills.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold tracking-wide uppercase flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full" style={bgThemeColor} />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center gap-1"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold tracking-wide uppercase flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full" style={bgThemeColor} />
                Education
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                {education.map((edu) => (
                  <div key={edu.id} className="flex flex-col">
                    <span className="font-extrabold text-slate-800">{edu.degree}</span>
                    <span className="text-slate-500 font-semibold">{edu.school}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold tracking-wide uppercase flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full" style={bgThemeColor} />
                Languages
              </h3>
              <ul className="flex flex-col gap-1 text-xs">
                {languages.map((l) => (
                  <li key={l.id} className="flex justify-between font-semibold">
                    <span>{l.name}</span>
                    <span className="text-slate-450 text-[10px]">({l.proficiency})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Selector mapping
  const renderTemplate = () => {
    switch (templateId) {
      case "modern-tech":
        return renderModernTech();
      case "creative-glass":
        return renderCreativeGlass();
      default:
        return renderATSClassic();
    }
  };

  return (
    <div
      id="resume-a4-sheet"
      className="print-area w-[210mm] min-h-[297mm] bg-white p-[15mm] text-black shadow-2xl relative transition-all mx-auto overflow-hidden select-text"
      style={fontStyle}
    >
      {renderTemplate()}
    </div>
  );
}
