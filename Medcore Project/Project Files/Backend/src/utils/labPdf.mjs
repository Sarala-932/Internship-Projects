import PDFDocument from "pdfkit";

export const generateLabReportPdfBuffer = (order, patient, hospital) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));

            // Hospital Header
            doc.fontSize(20).font("Helvetica-Bold").fillColor("#1a365d").text(hospital?.name || "MedCore Hospital", { align: "center" });
            if (hospital?.address) {
                const addr = `${hospital.address.line1 || ""}, ${hospital.address.city || ""}, ${hospital.address.state || ""} ${hospital.address.pincode || ""}`;
                doc.fontSize(10).font("Helvetica").fillColor("#4a5568").text(addr, { align: "center" });
            }
            if (hospital?.phone || hospital?.email) {
                doc.fontSize(10).text(`Phone: ${hospital.phone || "N/A"} | Email: ${hospital.email || "N/A"}`, { align: "center" });
            }

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#cccccc");
            doc.moveDown(0.5);

            // Title
            doc.fontSize(16).font("Helvetica-Bold").fillColor("#2b6cb0").text("LABORATORY REPORT", { align: "center" });
            doc.fontSize(10).font("Helvetica").fillColor("#666666").text(`Order No: ${order.orderNumber || "N/A"} | Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, { align: "center" });
            doc.moveDown();

            // Patient Info Box
            const startY = doc.y;
            doc.fillColor("#000000").fontSize(11).font("Helvetica-Bold").text("PATIENT DETAILS", 50, startY);
            doc.fontSize(10).font("Helvetica")
               .text(`Name: ${patient?.firstName || ""} ${patient?.lastName || ""}`)
               .text(`MRN: ${patient?.mrn || "N/A"}`)
               .text(`Gender / Blood Group: ${patient?.gender || "N/A"} / ${patient?.bloodGroup || "N/A"}`)
               .text(`Phone: ${patient?.phone || "N/A"}`);

            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
            doc.moveDown();

            // Test Results
            if (order.tests && order.tests.length > 0) {
                order.tests.forEach((test) => {
                    doc.fontSize(14).font("Helvetica-Bold").fillColor("#1a365d").text(test.name);
                    doc.fontSize(10).font("Helvetica-Oblique").fillColor("#718096").text(`Sample Type: ${test.sampleType || "N/A"} | Status: ${test.status}`);
                    doc.moveDown(0.5);

                    if (test.result && test.result.values && test.result.values.length > 0) {
                        const tableTop = doc.y;
                        doc.fillColor("#ffffff").rect(50, tableTop, 500, 20).fill("#2b6cb0");
                        doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold");
                        doc.text("Parameter", 55, tableTop + 5, { width: 150 });
                        doc.text("Result", 215, tableTop + 5, { width: 80 });
                        doc.text("Unit", 305, tableTop + 5, { width: 60 });
                        doc.text("Ref Range", 375, tableTop + 5, { width: 100 });
                        doc.text("Flag", 485, tableTop + 5, { width: 50 });

                        let y = tableTop + 25;
                        doc.fillColor("#000000").font("Helvetica").fontSize(9);

                        test.result.values.forEach((val, idx) => {
                            if (idx % 2 === 1) {
                                doc.fillColor("#f7fafc").rect(50, y - 3, 500, 18).fill();
                                doc.fillColor("#000000");
                            }

                            // Flag Highlights
                            if (val.flag === "H" || val.flag === "High") {
                                doc.fillColor("#e53e3e"); // Red for High
                            } else if (val.flag === "L" || val.flag === "Low") {
                                doc.fillColor("#dd6b20"); // Orange for Low
                            } else {
                                doc.fillColor("#000000");
                            }

                            doc.text(val.parameter || "N/A", 55, y, { width: 150 });
                            doc.text(val.value || "-", 215, y, { width: 80 });
                            
                            // Reset color for other columns
                            doc.fillColor("#000000");
                            doc.text(val.unit || "-", 305, y, { width: 60 });
                            doc.text(val.refRange || "-", 375, y, { width: 100 });
                            doc.text(val.flag || "N", 485, y, { width: 50 });
                            y += 22;
                        });
                        doc.y = y + 10;
                    } else {
                        doc.fontSize(10).font("Helvetica-Oblique").fillColor("#718096").text("Awaiting results...");
                        doc.moveDown(1);
                    }
                });
            }

            // Footer Signature
            const footerY = Math.max(doc.y + 40, 680);
            doc.moveTo(380, footerY).lineTo(530, footerY).stroke("#000000");
            doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000")
               .text("Authorized Signature", 380, footerY + 5, { width: 150, align: "center" })
               .fontSize(8).font("Helvetica").fillColor("#718096")
               .text("MedCore Laboratory Services", 380, footerY + 20, { width: 150, align: "center" });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
