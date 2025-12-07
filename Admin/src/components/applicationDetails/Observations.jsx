import React from "react";

export const Observations = ({observations}) => {
  return (
    <div className="w-fit">
      <h4 className="text-lg font-bold m-3">Comentarios:</h4>
      {observations && observations.trim() !== "" ? (
        <div className="flex flex-col gap-2">
          {observations.split(",").map((obs, index) => {
            const [date, status] = obs.split(" - ");
            let statusColor = "bg-gray-200";
            if (status === "APPROVED") statusColor = "bg-green-200";
            else if (status === "IN_REVIEW") statusColor = "bg-yellow-200";
            else if (status === "REJECTED") statusColor = "bg-red-200";

            return (
              <div
                key={index}
                className={`p-2 rounded-md shadow-sm ${statusColor}`}
              >
                <p>{obs}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Aún no se tienen comentarios...</p>
      )}
    </div>
  );
};
