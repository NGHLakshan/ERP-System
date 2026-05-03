import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download } from 'lucide-react';

export default function ExportButton({ data, title, filename, headers }) {
    const exportPDF = () => {
        const doc = jsPDF();
        
        // Add Title
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(title, 14, 22);
        
        // Add Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Add Table
        doc.autoTable({
            startY: 35,
            head: [headers],
            body: data.map(row => Object.values(row)),
            styles: { fontSize: 9 },
            headStyles: { fillStyle: 'f', fillColor: [99, 102, 241], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 247, 250] },
        });

        doc.save(`${filename}.pdf`);
    };

    return (
        <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
            <Download size={16} />
            Export PDF
        </button>
    );
}
