import React, { useEffect, useState } from "react";

const AiStockReport = ({ email }: { email: string }) => {
  const [report, setReport] = useState<string | null>(null);

  useEffect(() => {
    if (email) {
      fetch(`/api/report?email=${email}`)
        .then((res) => res.json())
        .then((data) => setReport(data.report))
        .catch((err) => console.error(err));
    }
  }, [email]);

  return (
    <div className="mt-6 p-4 border-2 border-base-200 rounded-3xl">
      <h2 className="font-bold text-lg mb-2 text-primary">
        Rapport Intelligent
      </h2>
      {report ? (
        <p className="text-sm whitespace-pre-line">{report}</p>
      ) : (
        <span className="loading loading-dots loading-lg"></span>
      )}
    </div>
  );
};

export default AiStockReport;
