import React from "react";

export default function EditAnimalSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse h-[90vh]">
      {/* CARD SUPERIOR */}
      <div className="flex gap-4 bg-slate-50 p-4 rounded-xl shadow">
        <div className="w-40 h-40 bg-slate-300 rounded-lg"></div>

        <div className="flex flex-col justify-center gap-3 w-full">
          <div className="h-4 w-28 bg-slate-300 rounded"></div>
          <div className="h-6 w-40 bg-slate-300 rounded"></div>

          <div className="h-4 w-20 bg-slate-300 rounded mt-3"></div>
          <div className="h-5 w-24 bg-slate-300 rounded"></div>
        </div>
      </div>

      {/* GRID DE EDAD Y ESTADO */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-100 p-4 rounded-lg flex flex-col gap-2">
          <div className="h-3 w-20 bg-slate-300 rounded"></div>
          <div className="h-5 w-24 bg-slate-300 rounded"></div>
        </div>

        <div className="bg-slate-100 p-4 rounded-lg flex flex-col gap-2">
          <div className="h-3 w-28 bg-slate-300 rounded"></div>
          <div className="h-5 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <div className="h-4 w-40 bg-slate-300 rounded mb-2"></div>
        <div className="w-full h-20 bg-slate-200 rounded-lg"></div>
      </div>

      {/* SELECTS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-slate-300 rounded"></div>
          <div className="h-10 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 bg-slate-300 rounded"></div>
          <div className="h-10 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* ESTADO */}
      <div>
        <div className="h-4 w-28 bg-slate-300 rounded mb-2"></div>
        <div className="h-10 bg-slate-200 rounded-lg"></div>
      </div>

      {/* FOTO */}
      <div>
        <div className="h-4 w-24 bg-slate-300 rounded mb-2"></div>
        <div className="h-10 bg-slate-200 rounded-lg"></div>
      </div>

      {/* BOTÓN */}
      <div className="w-full h-12 bg-blue-300 rounded-lg"></div>
    </div>
  );
}
