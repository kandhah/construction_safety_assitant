import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rfiData = req.body;
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      bufferPages: true
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=RFI-${rfiData.projectName}-${rfiData.date}.pdf`
    );

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Helper function for drawing lines
    const drawHorizontalLine = (y: number) => {
      doc
        .strokeColor('#CCCCCC')
        .moveTo(50, y)
        .lineTo(545, y)
        .stroke();
    };

    // Add header with logo placeholder
    doc
      .rect(50, 50, 495, 60)
      .fillColor('#f5f5f5')
      .fill();

    doc
      .fillColor('#333333')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('REQUEST FOR INFORMATION', 50, 65, {
        align: 'center',
        width: 495
      });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`RFI #: ${new Date().getTime().toString().slice(-4)}`, 50, 90, {
        align: 'center',
        width: 495
      });

    // Project Information Section
    doc.moveDown(2);
    const startY = doc.y;

    // Left column
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('PROJECT', 50, startY)
      .font('Helvetica')
      .fontSize(11)
      .text(rfiData.projectName, 50, doc.y + 5);

    doc
      .moveDown()
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('DISCIPLINE')
      .font('Helvetica')
      .fontSize(11)
      .text(rfiData.discipline, 50, doc.y + 5);

    // Right column
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('DATE', 300, startY)
      .font('Helvetica')
      .fontSize(11)
      .text(new Date(rfiData.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), 300, doc.y - 12);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('DUE DATE', 300, doc.y + 5)
      .font('Helvetica')
      .fontSize(11)
      .text(new Date(rfiData.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), 300, doc.y + 5);

    // Draw line under header section
    drawHorizontalLine(doc.y + 20);

    // Requester Information
    doc.moveDown(2);
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('SUBMITTED BY')
      .font('Helvetica')
      .fontSize(11)
      .text(rfiData.requestedBy, 50, doc.y + 5);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('PRIORITY', 300, doc.y - 12)
      .font('Helvetica')
      .fontSize(11)
      .fillColor(rfiData.priority === 'Urgent' ? '#FF0000' : '#333333')
      .text(rfiData.priority, 300, doc.y + 5);

    // Draw line under requester section
    drawHorizontalLine(doc.y + 20);

    // Subject Section
    doc.moveDown(2);
    doc
      .fillColor('#333333')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('SUBJECT', 50, doc.y)
      .fontSize(11)
      .font('Helvetica')
      .text(rfiData.subject, 50, doc.y + 5);

    // Description Section
    doc.moveDown(2);
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('DESCRIPTION OF INFORMATION REQUIRED', 50, doc.y)
      .fontSize(11)
      .font('Helvetica')
      .moveDown()
      .text(rfiData.description, {
        width: 495,
        align: 'justify'
      });

    // Response Section
    doc.moveDown(2);
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('RESPONSE', 50, doc.y)
      .fontSize(11)
      .font('Helvetica')
      .moveDown()
      .text('', {
        width: 495,
        height: 150
      });

    // Signature Section
    doc.moveDown(4);
    const signatureY = doc.y;

    // Left signature
    doc
      .fontSize(10)
      .text('Responded By:', 50, signatureY)
      .moveDown(2)
      .fontSize(10)
      .text('_______________________', 50)
      .moveDown()
      .text('Name & Title', 50);

    // Right signature
    doc
      .fontSize(10)
      .text('Date:', 300, signatureY)
      .moveDown(2)
      .fontSize(10)
      .text('_______________________', 300)
      .moveDown()
      .text('MM/DD/YYYY', 300);

    // Add footer to all pages
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Footer line
      drawHorizontalLine(750);
      
      // Footer text
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `${rfiData.projectName} - RFI Response Required by ${new Date(rfiData.dueDate).toLocaleDateString()}`,
          50,
          760,
          { align: 'left' }
        )
        .text(
          `Page ${i + 1} of ${pageCount}`,
          50,
          760,
          { align: 'right' }
        );
    }

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
} 