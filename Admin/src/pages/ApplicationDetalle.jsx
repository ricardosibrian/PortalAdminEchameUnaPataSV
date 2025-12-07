import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { GetApplicationById } from "../service/Adoptions";
import ObservationsField from "../components/ObservationsField";
import { UpdateApplicationStatus } from "../service/Adoptions";

import {
  CrueltyFree,
  Pets,
  MedicalServices,
  MedicationLiquid,
} from "@mui/icons-material";

export default function ApplicationDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [observation, setObservation] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await GetApplicationById(id);
        setApplication(res.data);
        setNewStatus(res.data.status);
      } catch (error) {
        console.error("Error cargando solicitud:", error);
      }
    };
    fetchApplication();
  }, [id]);

  const handleUpdate = async () => {
    const payload = {
      id: id,
      status: newStatus,
      observations: observation,
    };
    try {
      await UpdateApplicationStatus(payload);
      

      alert("Estado actualizado correctamente");
      navigate("/")
    } catch (error) {
      console.error("Error actualizando solicitud:", error);
      alert("Error al actualizar la solicitud");
    }
  };

  if (!application) return <p className="text-center mt-10">Cargando...</p>;

  const animal = application.animal;

  const details = [
    {
      label: "Especie",
      value: animal.species || " ⎯",
      bg: "bg-yellow-100",
      icon: <CrueltyFree className="text-yellow-600" fontSize="small" />,
    },
    {
      label: "Raza",
      value: animal.race || " ⎯",
      bg: "bg-pink-100",
      icon: <Pets className="text-pink-600" fontSize="small" />,
    },
    {
      label: "Esterilizado",
      value: animal.sterilized ? "Sí" : "No",
      bg: "bg-green-100",
      icon: <MedicalServices className="text-green-600" fontSize="small" />,
    },
    {
      label: "Amputado",
      value: animal.missingLimb ? "Sí" : "No",
      bg: "bg-blue-100",
      icon: <MedicationLiquid className="text-blue-600" fontSize="small" />,
    },
  ];

  return (
    <section className="h-fit max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
      <h2 className="text-3xl sm:text-4xl font-extrabold mb-2.5 text-gray-800 border-b-2 border-amber-400">
        Solicitud de {application.person.firstNames}
      </h2>
      {/* INFORMACIÓN DEL ANIMAL */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col lg:flex-row gap-8 mb-2.5">
        <div className="flex justify-center lg:w-1/2">
          <img
            src={animal.photo}
            alt={animal.name}
            className="w-full max-w-[330px] h-96 object-cover rounded-xl shadow"
          />
        </div>

        <div className="flex flex-col justify-center lg:w-1/2 gap-4">
          <span className="bg-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full w-max">
            {animal.sex || " ⎯"}
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold">
            {animal.name || " ⎯"}
          </h1>
          <p className="text-gray-700 text-lg">{animal.age || " ⎯"}</p>

          <h2 className="text-xl font-bold mt-4">Acerca de {animal.name}</h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {animal.initialDescription || "⎯"}
          </p>
        </div>
      </div>

      {/* DETALLES DEL ANIMAL */}
      <div className="bg-white shadow rounded-xl p-6 mb-2.5">
        <h3 className="text-2xl font-bold mb-6 text-center lg:text-left">
          Detalles de {animal.name}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {details.map((detail, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow-sm"
            >
              <div
                className={`${detail.bg} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2`}
              >
                {detail.icon}
              </div>
              <p className="font-semibold text-sm">{detail.label}</p>
              <p className="text-gray-600 text-sm break-words">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* INFORMACIÓN DEL SOLICITANTE */}
      <div className="bg-white shadow rounded-xl p-6 mb-2.5">
        <h3 className="text-2xl font-bold mb-6">Información del solicitante</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <p>
            <strong>Nombre:</strong> {application.person.firstNames || " ⎯"}{" "}
            {application.person.lastNames || " ⎯"}
          </p>
          <p>
            <strong>Email:</strong> {application.person.email || " ⎯"}
          </p>
          <p>
            <strong>Teléfono:</strong> {application.person.phoneNumber || " ⎯"}
          </p>
          <p>
            <strong>DUI:</strong> {application.person.dui || " ⎯"}
          </p>
          <p>
            <strong>Dirección:</strong> {application.person.address || " ⎯"}
          </p>
          <p>
            <strong>Ciudad:</strong> {application.person.city || " ⎯"}
          </p>
          <p>
            <strong>Hogar propio:</strong> {application.ownHome ? "Sí" : "No"}
          </p>
          <p>
            <strong>Acepta visitas:</strong>{" "}
            {application.acceptsVisits ? "Sí" : "No"}
          </p>
          <p>
            <strong>Compromiso esterilización:</strong>{" "}
            {application.commitmentToSterilization ? "Sí" : "No"}
          </p>
          <p>
            <strong>Compromiso envío fotos:</strong>{" "}
            {application.commitmentToSendPhotos ? "Sí" : "No"}
          </p>
          <p>
            <strong>Veterinario:</strong> {application.veterinarianName || " ⎯"}{" "}
            ({application.veterinarianPhone || " ⎯"})
          </p>
        </div>
        {/* REFERENCIAS */}
        <div className="py-6 w-fit">
          <h4 className="text-lg font-bold mb-2">Referencias</h4>
          {application.adoptionReferences.length > 0 ? (
            <ul className="list-disc pl-5">
              {application.adoptionReferences.map((ref, i) => (
                <li key={i}>
                  {ref.name || " ⎯"}{" "}
                  {ref.phoneNumber ? `- ${ref.phoneNumber}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p>N/A</p>
          )}
        </div>
        <div className="w-fit">
          <h4 className="text-lg font-bold m-3">Comentarios:</h4>
          {application.observations != null ? (
            <p>{application.observations}</p>
          ) : (
            <p>Aun no se tienen comentarios...</p>
          )}
        </div>
      </div>

      {/* CAMBIO DE ESTADO */}
      <div className="bg-white shadow rounded-xl p-6 mb-2.5">
        <h4 className="text-lg font-bold mb-3">Actualizar estado</h4>
        <div className="flex flex-col gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="border border-gray-300 rounded w-fit px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="PENDING">Pendiente</option>
            <option value="IN_REVIEW">El Revision</option>
            <option value="REJECTED">Rechazada</option>
            <option value="REJECTED">Aprovada</option>
          </select>

          {/* Mostrar observación solo si es rechazado o aprobado opcional */}
          {(newStatus === "REJECTED" ||
            newStatus === "APPROVED" ||
            newStatus === "IN_REVIEW") && (
            <ObservationsField
              title="Observaciones"
              description={
                newStatus === "REJECTED"
                  ? "Indica el motivo del rechazo"
                  : "Puedes agregar un comentario opcional sobre la toma en cuenta"
              }
              name="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          )}

          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded font-semibold transition text-amber-50 w-fit"
          >
            Actualizar
          </button>
        </div>
      </div>
    </section>
  );
}
