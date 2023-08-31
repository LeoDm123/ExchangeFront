import React from "react";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import { useState } from "react";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import swal from "sweetalert";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import serverAPI from "../../api/serverAPI";

interface CapModalProps {
  open: boolean;
  onClose: () => void;
}

const CapModal: React.FC<CapModalProps> = ({ open, onClose }) => {
  const [Detalle, setDetalle] = useState("");
  const [Divisa, setDivisa] = useState("");
  const [Monto, setMonto] = useState("");
  const [Comentarios, setComentarios] = useState("");

  const Email = localStorage.getItem("loggedInUserEmail") || "";

  const movimientoCapital = async (
    Detalle: string,
    Divisa: string,
    Monto: number,
    Comentarios: string,
    Email: string
  ) => {
    try {
      const resp = await serverAPI.post("/cap/movimientoCapital", {
        Detalle,
        Divisa,
        Monto,
        Comentarios,
        Email,
        Fecha: "",
      });

      console.log(resp);
      SwAlert();
      onClose();
    } catch (error) {
      SwAlertErrorFondos();
    }
  };

  const currencies = [
    {
      value: "USD",
      label: "U$D",
    },
    {
      value: "EUR",
      label: "€",
    },
    {
      value: "ARS",
      label: "ARS",
    },
  ];

  const detalles = [
    {
      value: "Ingreso",
      label: "Ingreso",
    },
    {
      value: "Retiro",
      label: "Retiro",
    },
  ];

  const SwAlert = () => {
    swal({
      title: "¡Exito!",
      text: "El movimiento se agregó correctamente",
      icon: "success",
    });
  };

  const SwAlertErrorFondos = () => {
    swal({
      title: "¡Error!",
      text: "No posee los fondos suficientes para realizar la operación",
      icon: "error",
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Detalle:", Detalle);
    console.log("Divisa:", Divisa);
    console.log("Monto:", Monto);
    console.log("Comentarios:", Comentarios);
    console.log("Email:", Email);

    if (Detalle === "" || Divisa === "" || Monto === "") {
      return console.log("todos los campos son obligatorios");
    }

    movimientoCapital(Detalle, Divisa, parseFloat(Monto), Comentarios, Email);
    setDetalle("");
    setDivisa("");
    setMonto("");
    setComentarios("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          p: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        className="CreateModal"
      >
        <form id="registerForm" onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between mb-2">
            <h1 className="h3">Agregar / Retirar Capital</h1>
            <HighlightOffIcon onClick={onClose} fontSize="large" />
          </div>

          {/* ACCION */}
          <div className="d-flex flex-direction-row">
            <div className="w-100 me-3">
              <div className=" w-100 mt-3">
                <TextField
                  id="outlined-select-currency"
                  className="w-100"
                  select
                  label="Detalle"
                  defaultValue=""
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
              {/* MONEDA */}
              <div className=" w-100 mt-3">
                <TextField
                  id="outlined-select-currency"
                  className="w-100"
                  select
                  label="Divisa"
                  defaultValue=""
                  onChange={(e) => setDivisa(e.target.value)}
                  helperText="Por favor, seleccione su divisa"
                >
                  {currencies.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* MONTO */}
              <FormControl fullWidth className="mt-3">
                <InputLabel htmlFor="outlined-adornment-amount">
                  Monto
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  startAdornment={
                    <InputAdornment position="start">{Divisa}</InputAdornment>
                  }
                  label="monto"
                  onChange={(e) => setMonto(e.target.value)}
                />
              </FormControl>
              {/* COMENTARIOS */}
              <TextField
                fullWidth
                className="mt-3"
                id="outlined-multiline-static"
                label="Comentarios"
                multiline
                rows={4}
                defaultValue=""
                onChange={(e) => setComentarios(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary w-100 py-2 mt-4" type="submit">
            Confirmar
          </button>
        </form>
      </Paper>
    </Modal>
  );
};

export default CapModal;
