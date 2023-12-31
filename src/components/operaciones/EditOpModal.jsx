import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import serverAPI from "../../api/serverAPI";
import swal from "sweetalert";

const currencies = [
  {
    value: "USD",
    label: "U$D",
  },
  {
    value: "EUR",
    label: "€",
  },
];

const detalles = [
  {
    value: "Compra",
    label: "Compra",
  },
  {
    value: "Venta",
    label: "Venta",
  },
];

const OpEditModal = ({ open, onClose, onOperationChange, operation }) => {
  const [Detalle, setDetalle] = useState("");
  const [Divisa, setDivisa] = useState("");
  const [Monto, setMonto] = useState("");
  const [TipoCambio, setTipoCambio] = useState("");
  const [Comentarios, setComentarios] = useState("");
  const [MontoTotal, setMontoTotal] = useState("");
  const [dateValue, setDateValue] = useState("");

  useEffect(() => {
    if (operation) {
      setDetalle(operation.Detalle);
      setDivisa(operation.Divisa);
      setMonto(operation.Monto.toString());
      setTipoCambio(operation.TipoCambio.toString());
      setComentarios(operation.Comentarios);
      setMontoTotal(operation.MontoTotal.toString());
      setDateValue(operation.Fecha.toString());
    }
  }, [operation]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      Detalle === "" ||
      Divisa === "" ||
      Monto === "" ||
      TipoCambio === "" ||
      !operation
    ) {
      return console.log("Todos los campos son obligatorios");
    }

    console.log("iD:", operation._id);

    const parsedDate = parseDate(dateValue);

    if (!parsedDate) {
      console.log("Invalid date format");
      return;
    }

    try {
      await serverAPI.put(`/op/EditOp/${operation._id}`, {
        Detalle,
        Divisa,
        Monto: parseFloat(Monto),
        TipoCambio: parseFloat(TipoCambio),
        Comentarios,
        MontoTotal: parseFloat(MontoTotal),
        Fecha: dateValue,
      });

      onOperationChange();
      onClose();
    } catch (error) {
      console.error("Error al editar la operación:", error);
    }
  };

  const DeleteOp = async (_id) => {
    try {
      const deleteResp = await serverAPI.delete(`/op/DeleteOp/${_id}`);

      if (deleteResp.data.message === "Operation deleted successfully") {
        console.log(deleteResp);
      } else {
        console.log("Cancel operation failed.");
      }
      onOperationChange();
    } catch (error) {
      console.error(error);
    }
  };

  const SwAlertDelete = (_id) => {
    swal({
      title: "¿Desea borrar la operación?",
      text: "Una vez borrada, esta no podrá ser recuperada",
      icon: "warning",
      buttons: ["No", "Sí"],
      dangerMode: true,
    }).then((willCancel) => {
      if (willCancel) {
        swal("¡Operación borrada con éxito!", {
          icon: "success",
        });
        DeleteOp(_id);
        onClose();
      }
    });
  };

  useEffect(() => {
    if (Monto !== "" && TipoCambio !== "") {
      const MontoTotal = parseFloat(Monto) * parseFloat(TipoCambio);
      setMontoTotal(MontoTotal.toString());
    }
  }, [Monto, TipoCambio]);

  function parseDate(dateString) {
    // Split the date and time parts
    const parts = dateString.split(", ");
    if (parts.length === 2) {
      const datePart = parts[0];
      const timePart = parts[1];

      // Split the date into MM, DD, YYYY parts
      const dateParts = datePart.split("/");
      if (dateParts.length === 3) {
        const month = parseInt(dateParts[0], 10) - 1; // Months are 0-indexed
        const day = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);

        // Parse the time part
        const timeParts = timePart.split(":");
        if (timeParts.length === 3) {
          let hour = parseInt(timeParts[0], 10);
          const minute = parseInt(timeParts[1], 10);
          const second = parseInt(timeParts[2], 10);

          // Check if AM or PM
          const isPM = timePart.toLowerCase().includes("pm");
          if (
            isNaN(month) ||
            isNaN(day) ||
            isNaN(year) ||
            isNaN(hour) ||
            isNaN(minute) ||
            isNaN(second)
          ) {
            return null; // Invalid date or time format
          }

          // Adjust hour for AM/PM
          if (isPM && hour !== 12) {
            hour += 12;
          } else if (!isPM && hour === 12) {
            hour = 0;
          }

          // Create a Date object
          return new Date(year, month, day, hour, minute, second);
        }
      }
    }
    return null; // Invalid date format
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          p: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 5,
        }}
        className="CreateModal"
      >
        <form id="editForm" onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between mb-2">
            <h1 className="h3">Editar Operación</h1>
            <HighlightOffIcon
              onClick={onClose}
              fontSize="large"
              sx={{ color: "#6a6a6a" }}
            />
          </div>

          <div className="d-flex flex-direction-row">
            <div className="w-100 me-3">
              <div className="w-100 mt-3">
                <TextField
                  id="outlined-select-currency"
                  className="w-100"
                  select
                  label="Detalle"
                  value={Detalle}
                  onChange={(e) => setDetalle(e.target.value)}
                  helperText="Por favor, seleccione el tipo de movimiento"
                >
                  {detalles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <div className="d-flex">
                <div className="w-50 mt-3">
                  <TextField
                    id="outlined-select-currency"
                    className="w-100"
                    select
                    label="Divisa"
                    value={Divisa}
                    onChange={(e) => setDivisa(e.target.value)}
                  >
                    {currencies.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
                <div className="w-50 mt-3 ms-2">
                  <TextField
                    label="Fecha"
                    type="text"
                    className="w-100"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    placeholder="yyyy-mm-dd"
                  />
                </div>
              </div>

              <div className="d-flex">
                <div className="w-50">
                  <FormControl fullWidth className="mt-3">
                    <InputLabel htmlFor="outlined-adornment-amount">
                      Monto
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-amount"
                      startAdornment={
                        <InputAdornment position="start">
                          {Divisa}
                        </InputAdornment>
                      }
                      label="Monto"
                      value={Monto}
                      onChange={(e) => setMonto(e.target.value)}
                    />
                  </FormControl>
                </div>
                <div className="w-50 ms-2">
                  <FormControl fullWidth className="mt-3">
                    <InputLabel htmlFor="outlined-adornment-amount">
                      Tipo de Cambio
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-amount"
                      startAdornment={
                        <InputAdornment position="start">$</InputAdornment>
                      }
                      label="Tipo de Cambio"
                      value={TipoCambio}
                      onChange={(e) => setTipoCambio(e.target.value)}
                    />
                  </FormControl>
                </div>
              </div>

              <p>Monto total de la operación: ${MontoTotal}</p>

              <TextField
                fullWidth
                className="mt-3"
                id="outlined-multiline-static"
                label="Comentarios"
                multiline
                rows={4}
                value={Comentarios}
                onChange={(e) => setComentarios(e.target.value)}
              />
            </div>
          </div>
          <div className="justify-content-end d-flex me-3">
            <Button
              variant="outlined"
              color="error"
              type="submit"
              style={{
                borderRadius: 10,
                marginTop: 10,
                marginRight: 10,
              }}
              onClick={() => operation && SwAlertDelete(operation._id)}
            >
              Borrar
            </Button>

            <Button
              variant="contained"
              type="submit"
              style={{
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Paper>
    </Modal>
  );
};

export default OpEditModal;
