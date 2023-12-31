import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import swal from "sweetalert";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import serverAPI from "../../api/serverAPI";

const OpModal = ({ open, onClose, onOperationChange }) => {
  const [Detalle, setDetalle] = useState("");
  const [Divisa, setDivisa] = useState("");
  const [Monto, setMonto] = useState("");
  const [TipoCambio, setTipoCambio] = useState("");
  const [Comentarios, setComentarios] = useState("");
  const [MontoTotal, setMontoTotal] = useState("");

  const Email = localStorage.getItem("loggedInUserEmail") || "";

  const movimientoCapital = async (
    Detalle,
    Divisa,
    Monto,
    Comentarios,
    TipoCambio,
    MontoTotal,
    Email
  ) => {
    try {
      const resp = await serverAPI.post("/op/Operacion", {
        Detalle,
        Divisa,
        Monto: Monto.toString(),
        TipoCambio: TipoCambio.toString(),
        MontoTotal: MontoTotal.toString(),
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

  useEffect(() => {
    if (Monto !== "" && TipoCambio !== "") {
      const MontoTotal = parseFloat(Monto) * parseFloat(TipoCambio);
      setMontoTotal(MontoTotal.toString());
    }
  }, [Monto, TipoCambio]);

  const currencies = [
    { value: "USD", label: "U$D" },
    { value: "EUR", label: "€" },
  ];

  const detalles = [
    { value: "Compra", label: "Compra" },
    { value: "Venta", label: "Venta" },
  ];

  const SwAlert = () => {
    swal({
      title: "¡Exito!",
      text: "La operación se agregó correctamente",
      icon: "success",
      timer: 1000,
    });
  };

  const SwAlertErrorFondos = () => {
    swal({
      title: "¡Error!",
      text: "No posee los fondos suficientes para realizar la operación",
      icon: "error",
      timer: 1000,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Detalle:", Detalle);
    console.log("Divisa:", Divisa);
    console.log("Monto:", Monto);
    console.log("Tipo de cambio:", TipoCambio);
    console.log("Comentarios:", Comentarios);
    console.log("Monto Total:", MontoTotal);

    if (Detalle === "" || Divisa === "" || Monto === "" || TipoCambio === "") {
      return console.log("todos los campos son obligatorios");
    }

    const parsedMonto = parseFloat(Monto);
    const parsedTipoCambio = parseFloat(TipoCambio);
    const parsedMontoTotal = parseFloat(MontoTotal);

    movimientoCapital(
      Detalle,
      Divisa,
      parsedMonto,
      Comentarios,
      parsedTipoCambio,
      parsedMontoTotal,
      Email
    );

    onOperationChange();

    setDetalle("");
    setDivisa("");
    setMonto("");
    setMontoTotal("");
    setTipoCambio("");
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
          borderRadius: 5,
        }}
        className="CreateModal"
      >
        <form id="registerForm" onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between mb-2">
            <h1 className="h3">Nueva Operación</h1>
            <HighlightOffIcon
              onClick={onClose}
              fontSize="large"
              sx={{ color: "#6a6a6a" }}
            />
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
                >
                  {currencies.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div className="d-flex">
                {/* MONTO */}
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
                      onChange={(e) => setMonto(e.target.value)}
                    />
                  </FormControl>
                </div>
                {/* TIPO DE CAMBIO */}
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
                      onChange={(e) => setTipoCambio(e.target.value)}
                    />
                  </FormControl>
                </div>
              </div>

              <p>Monto total de la operación: ${MontoTotal}</p>
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
          <div className="justify-content-end d-flex me-3">
            <Button
              variant="contained"
              type="submit"
              style={{
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </Paper>
    </Modal>
  );
};

export default OpModal;
