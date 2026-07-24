import PDFDocument from "pdfkit";

export const generatePrescriptionPdfBuffer = (prescription, doctor, patient, hospital) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));

            // Hospital Header
            doc.fontSize(20).font("Helvetica-Bold").text(hospital?.name || "MedCore Hospital", { align: "center" });
            if (hospital?.address) {
                const addr = `${hospital.address.line1 || ""}, ${hospital.address.city || ""}, ${hospital.address.state || ""} ${hospital.address.pincode || ""}`;
                doc.fontSize(10).font("Helvetica").text(addr, { align: "center" });
            }
            if (hospital?.phone || hospital?.email) {
                doc.fontSize(10).text(`Phone: ${hospital.phone || "N/A"} | Email: ${hospital.email || "N/A"}`, { align: "center" });
            }

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#cccccc");
            doc.moveDown(0.5);

            // Title & Rx Number
            doc.fontSize(16).font("Helvetica-Bold").fillColor("#1a365d").text("MEDICAL PRESCRIPTION", { align: "center" });
            doc.fontSize(10).font("Helvetica").fillColor("#666666").text(`Rx No: ${prescription.rxNumber} | Date: ${new Date(prescription.createdAt || Date.now()).toLocaleDateString()}`, { align: "center" });
            doc.moveDown();

            // Doctor & Patient Info Boxes
            const startY = doc.y;

            // Doctor Info (Left)
            doc.fillColor("#000000").fontSize(11).font("Helvetica-Bold").text("DOCTOR DETAILS", 50, startY);
            doc.fontSize(10).font("Helvetica")
               .text(`Dr. ${doctor?.firstName || ""} ${doctor?.lastName || ""}`)
               .text(`Specialization: ${doctor?.specialization?.join(", ") || "General Physician"}`)
               .text(`Email: ${doctor?.email || "N/A"}`);

            // Patient Info (Right)
            doc.fontSize(11).font("Helvetica-Bold").text("PATIENT DETAILS", 320, startY);
            doc.fontSize(10).font("Helvetica")
               .text(`Name: ${patient?.firstName || ""} ${patient?.lastName || ""}`)
               .text(`MRN: ${patient?.mrn || "N/A"}`)
               .text(`Gender / Blood Group: ${patient?.gender || "N/A"} / ${patient?.bloodGroup || "N/A"}`)
               .text(`Phone: ${patient?.phone || "N/A"}`);

            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
            doc.moveDown();

            // Rx Symbol
            doc.fontSize(22).font("Helvetica-Bold").fillColor("#2b6cb0").text("Rx", 50, doc.y);
            doc.moveDown(0.5);

            // Medicines Table Header
            const tableTop = doc.y;
            doc.fillColor("#ffffff").rect(50, tableTop, 500, 20).fill("#2b6cb0");
            doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold");
            doc.text("Medicine Name", 55, tableTop + 5, { width: 160 });
            doc.text("Dosage", 225, tableTop + 5, { width: 70 });
            doc.text("Frequency", 300, tableTop + 5, { width: 70 });
            doc.text("Days", 375, tableTop + 5, { width: 50 });
            doc.text("Instructions", 430, tableTop + 5, { width: 115 });

            let y = tableTop + 25;
            doc.fillColor("#000000").font("Helvetica").fontSize(9);

            if (prescription.medicines && prescription.medicines.length > 0) {
                prescription.medicines.forEach((med, idx) => {
                    if (idx % 2 === 1) {
                        doc.fillColor("#f7fafc").rect(50, y - 3, 500, 18).fill();
                        doc.fillColor("#000000");
                    }

                    doc.text(med.name || "N/A", 55, y, { width: 160 });
                    doc.text(med.dosage || "-", 225, y, { width: 70 });
                    doc.text(med.frequency || "-", 300, y, { width: 70 });
                    doc.text(med.durationDays ? `${med.durationDays}d` : "-", 375, y, { width: 50 });
                    doc.text(med.instructions || "-", 430, y, { width: 115 });
                    y += 22;
                });
            } else {
                doc.text("No medicines listed", 55, y);
                y += 22;
            }

            doc.y = y + 10;
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
            doc.moveDown();

            // General Instructions
            if (prescription.generalInstructions) {
                doc.fontSize(10).font("Helvetica-Bold").fillColor("#2d3748").text("General Advice / Instructions:");
                doc.fontSize(9).font("Helvetica").fillColor("#4a5568").text(prescription.generalInstructions);
                doc.moveDown();
            }

            // Footer Signature
            const footerY = Math.max(doc.y + 40, 680);
            doc.moveTo(380, footerY).lineTo(530, footerY).stroke("#000000");
            doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000")
               .text(`Dr. ${doctor?.firstName || ""} ${doctor?.lastName || ""}`, 380, footerY + 5, { width: 150, align: "center" })
               .fontSize(8).font("Helvetica").fillColor("#718096")
               .text("Authorized Medical Practitioner", 380, footerY + 20, { width: 150, align: "center" });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
