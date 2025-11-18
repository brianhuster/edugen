import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { Question, StandardQuestion, THPT2025Question } from './types';

export function generateDocx(questions: Question[], title: string = 'ĐỀ THI TRẮC NGHIỆM') {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          new Paragraph({
            text: 'Họ và tên: ....................................... Lớp: ............',
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            text: '---',
            spacing: { after: 400 },
          }),

          // Questions section
          ...generateQuestionsSection(questions),

          // Page break
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Answer key section
          new Paragraph({
            text: 'PHẦN ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          ...generateAnswerKeySection(questions),
        ],
      },
    ],
  });

  return doc;
}

function generateQuestionsSection(questions: Question[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  questions.forEach((question, index) => {
    if (question.type === 'standard') {
      paragraphs.push(...generateStandardQuestion(question, index + 1));
    } else {
      paragraphs.push(...generateTHPT2025Question(question, index + 1));
    }
  });

  return paragraphs;
}

function generateStandardQuestion(question: StandardQuestion, number: number): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `Câu ${number}: `,
          bold: true,
        }),
        new TextRun({
          text: question.question,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `A. ${question.options.A}`,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `B. ${question.options.B}`,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `C. ${question.options.C}`,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `D. ${question.options.D}`,
      spacing: { after: 300 },
    }),
  ];
}

function generateTHPT2025Question(question: THPT2025Question, number: number): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `Câu ${number}: `,
          bold: true,
        }),
        new TextRun({
          text: question.context,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Đánh giá Đúng/Sai cho các mệnh đề sau:',
          italics: true,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `a) ${question.statements.a}`,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `b) ${question.statements.b}`,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `c) ${question.statements.c}`,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `d) ${question.statements.d}`,
      spacing: { after: 300 },
    }),
  ];
}

function generateAnswerKeySection(questions: Question[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Answer table
  const answerRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Câu', bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Đáp án', bold: true })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 85, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  questions.forEach((question, index) => {
    const answer =
      question.type === 'standard'
        ? question.correctAnswer
        : `a-${question.correctAnswers.a ? 'Đ' : 'S'}, b-${question.correctAnswers.b ? 'Đ' : 'S'}, c-${question.correctAnswers.c ? 'Đ' : 'S'}, d-${question.correctAnswers.d ? 'Đ' : 'S'}`;

    answerRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: `${index + 1}`, alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            children: [new Paragraph({ text: answer, alignment: AlignmentType.CENTER })],
          }),
        ],
      })
    );
  });

  paragraphs.push(
    new Paragraph({
      text: 'Bảng đáp án:',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
    })
  );

  // Add explanation section
  paragraphs.push(
    new Paragraph({
      text: '',
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: 'Hướng dẫn giải chi tiết:',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
    })
  );

  questions.forEach((question, index) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Câu ${index + 1}: `,
            bold: true,
          }),
        ],
        spacing: { after: 100 },
      })
    );

    if (question.explanation) {
      paragraphs.push(
        new Paragraph({
          text: question.explanation,
          spacing: { after: 200 },
        })
      );
    } else {
      const answer =
        question.type === 'standard'
          ? `Đáp án đúng: ${question.correctAnswer}`
          : `Đáp án: a-${question.correctAnswers.a ? 'Đúng' : 'Sai'}, b-${question.correctAnswers.b ? 'Đúng' : 'Sai'}, c-${question.correctAnswers.c ? 'Đúng' : 'Sai'}, d-${question.correctAnswers.d ? 'Đúng' : 'Sai'}`;
      
      paragraphs.push(
        new Paragraph({
          text: answer,
          spacing: { after: 200 },
        })
      );
    }
  });

  return paragraphs;
}
