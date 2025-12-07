import React,{ useState } from "react";
import CustomSelect from "../components/CustomSelect";
import "../styles/TablaPerros.css";

export default function TablaPerros({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selected, setSelected] = useState([]); 
  const [selectAll, setSelectAll] = useState(false); 

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const startIndex = page * rowsPerPage;
  const visibleRows = data.slice(startIndex, startIndex + rowsPerPage);

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);

    if (newValue) {
      setSelected(visibleRows.map((r) => r.id));
    } else {
      setSelected((prev) =>
        prev.filter((id) => !visibleRows.some((r) => r.id === id))
      );
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selected.includes(row.id));

  useState(() => {
    setSelectAll(allVisibleSelected);
  }, [selected, page, rowsPerPage]);

  return (
    <div className="tabla-perros-container">
      <div className="tabla-wrapper">
        <table className="tabla-perros">
          <thead>
            <tr>
              <th className="th">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="th">Nombre</th>
              <th className="th">Animal</th>
              <th className="th">Raza</th>
              <th className="th">Género</th>
              <th className="th">Estado</th>
              <th className="th">Opciones</th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((item) => (
              <tr key={item.id}>
                <td className="td">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleOne(item.id)}
                  />
                </td>
                <td className="td">{item.nombre}</td>
                <td className="td">{item.animal}</td>
                <td className="td">{item.raza}</td>
                <td className="td">{item.genero}</td>
                <td className="td">{item.estado}</td>
                <td className="td">
                  <span className="editar-boton">EDITAR</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="paginacion">
        <div className="paginacion-botones">
          <button
            onClick={handlePrev}
            disabled={page === 0}
            className="paginacion-btn"
          >
            Anterior
          </button>

          <button
            onClick={handleNext}
            disabled={page === totalPages - 1}
            className="paginacion-btn"
          >
            Siguiente
          </button>
        </div>

        <span style={{ color: "#555" }}>
          Página <strong>{page + 1}</strong> de {totalPages}
        </span>
        <div className="rows-control">
          <span>Rows per page:</span>

          <CustomSelect
            value={rowsPerPage}
            onChange={handleRowsChange}
            options={[
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}