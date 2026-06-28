import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { Resume } from "../types";
import { databaseService } from "../services/appwrite";

export async function exportToDocx(resume: Resume): Promise<{ success: boolean; fileName?: string; error?: string }> {
  try {
    const cleanFirstName = resume.personalInfo.firstName || "John";
    const cleanLastName = resume.personalInfo.lastName || "Doe";
    const fileName = `${cleanFirstName}_${cleanLastName}_Resume.docx`;

    // Create paragraphs array
    const docChildren: any[] = [];

    // Header Name
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`,
            bold: true,
            size: 32,
            font: "Arial"
          })
        ]
      })
    );

    // Job Title
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: resume.personalInfo.title.toUpperCase(),
            bold: true,
            size: 20,
            font: "Arial",
            color: "333333"
          })
        ]
      })
    );

    // Contact Details
    const contactParts = [];
    if (resume.personalInfo.email) contactParts.push(resume.personalInfo.email);
    if (resume.personalInfo.phone) contactParts.push(resume.personalInfo.phone);
    if (resume.personalInfo.location) contactParts.push(resume.personalInfo.location);
    if (resume.personalInfo.website) contactParts.push(resume.personalInfo.website);

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            size: 18,
            font: "Arial",
            color: "666666"
          })
        ]
      })
    );

    // Summary
    if (resume.summary) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 100, after: 100 },
          children: [
            new TextRun({
              text: "PROFESSIONAL SUMMARY",
              bold: true,
              size: 22,
              font: "Arial"
            })
          ]
        })
      );
      docChildren.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: resume.summary,
              size: 20,
              font: "Arial"
            })
          ]
        })
      );
    }

    // Experience
    if (resume.experience.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: "WORK HISTORY",
              bold: true,
              size: 22,
              font: "Arial"
            })
          ]
        })
      );

      resume.experience.forEach((exp) => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: `${exp.position}  -  ${exp.company}`,
                bold: true,
                size: 20,
                font: "Arial"
              }),
              new TextRun({
                text: ` (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})`,
                size: 18,
                font: "Arial",
                color: "555555"
              })
            ]
          })
        );
        docChildren.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: exp.description,
                size: 20,
                font: "Arial"
              })
            ]
          })
        );
      });
    }

    // Projects
    if (resume.projects.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: "SELECT PROJECTS",
              bold: true,
              size: 22,
              font: "Arial"
            })
          ]
        })
      );

      resume.projects.forEach((proj) => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: proj.name,
                bold: true,
                size: 20,
                font: "Arial"
              }),
              new TextRun({
                text: `  (${proj.technologies.join(", ")})`,
                size: 18,
                font: "Arial",
                color: "555555"
              })
            ]
          })
        );
        docChildren.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: proj.description,
                size: 20,
                font: "Arial"
              })
            ]
          })
        );
      });
    }

    // Education
    if (resume.education.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: "EDUCATION",
              bold: true,
              size: 22,
              font: "Arial"
            })
          ]
        })
      );

      resume.education.forEach((edu) => {
        docChildren.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `${edu.degree} in ${edu.fieldOfStudy}`,
                bold: true,
                size: 20,
                font: "Arial"
              }),
              new TextRun({
                text: `  |  ${edu.school} (${edu.startDate} - ${edu.endDate})`,
                size: 20,
                font: "Arial"
              })
            ]
          })
        );
      });
    }

    // Skills
    if (resume.skills.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: "SKILLS",
              bold: true,
              size: 22,
              font: "Arial"
            })
          ]
        })
      );

      const skillList = resume.skills.map((s) => `${s.name} (${s.level})`).join(", ");
      docChildren.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: skillList,
              size: 20,
              font: "Arial"
            })
          ]
        })
      );
    }

    // Create docx document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    // Compile document
    const blob = await Packer.toBlob(doc);
    
    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Save to export history logs
    try {
      await databaseService.addExportRecord({
        userId: resume.userId,
        resumeId: resume.id,
        resumeTitle: resume.title,
        format: "docx",
        fileName: fileName.replace(/\.docx$/, "")
      });
    } catch (err) {
      console.warn("Failed to write DOCX export log:", err);
    }

    return { success: true, fileName };
  } catch (error: any) {
    console.error("DOCX compiler error:", error);
    return { success: false, error: error.message || "Failed to compile Word document" };
  }
}
