import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import serverAPI from "../api/serverAPI";

const headCells = [
  { id: "Detalle", numeric: false, disablePadding: false, label: "Detalle" },
  { id: "Divisa", numeric: true, disablePadding: false, label: "Divisa" },
  { id: "Monto", numeric: true, disablePadding: false, label: "Monto" },
  {
    id: "TipoCambio",
    numeric: true,
    disablePadding: false,
    label: "Tipo de Cambio",
  },
  {
    id: "MontoTotal",
    numeric: true,
    disablePadding: false,
    label: "Monto Total",
  },
  { id: "Fecha", numeric: false, disablePadding: false, label: "Fecha" },
  {
    id: "SaldoPesos",
    numeric: false,
    disablePadding: false,
    label: "Saldo Pesos",
  },
  {
    id: "SaldoDolares",
    numeric: false,
    disablePadding: false,
    label: "Saldo Dolares",
  },
  {
    id: "SaldoEuros",
    numeric: false,
    disablePadding: false,
    label: "Saldo Euros",
  },
];

const cellWidths = {
  Detalle: "10%",
  Divisa: "8%",
  Monto: "14%",
  TipoCambio: "12%",
  MontoTotal: "12%",
  Fecha: "12%",
  SaldoPesos: "12%",
  SaldoDolares: "12%",
  SaldoEuros: "12%",
};

function EnhancedTableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="center"
            style={{
              width: cellWidths[headCell.id],
              marginLeft: 0,
              fontWeight: "bold",
            }}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function BalanceComp() {
  const [mergedData, setMergedData] = useState([]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchAndMergeData = async () => {
      try {
        const movimientosResp = await serverAPI.get("/cap/obtenerMovimientos");
        const operacionesResp = await serverAPI.get("/op/obtenerOperaciones");

        const movimientosData = transformMovimientos(movimientosResp.data);
        const operacionesData = transformOperaciones(operacionesResp.data);

        const mergedData = [...movimientosData, ...operacionesData];

        let saldoPesos = 0;
        let saldoDolares = 0;
        let saldoEuros = 0;

        mergedData.sort(
          (a, b) => new Date(a.Fecha).getTime() - new Date(b.Fecha).getTime()
        );

        mergedData.forEach((row) => {
          if (row.Divisa === "USD") {
            if (row.Detalle === "Compra") {
              saldoDolares += row.Monto;
              saldoPesos -= row.MontoTotal || 0;
            } else if (row.Detalle === "Venta") {
              saldoDolares -= row.Monto;
              saldoPesos += row.MontoTotal || 0;
            } else if (
              row.Detalle === "Ingreso Cap." ||
              row.Detalle === "Ingreso Op." ||
              row.Detalle === "Prestamo"
            ) {
              saldoDolares += row.Monto;
            } else if (
              row.Detalle === "Retiro Cap." ||
              row.Detalle === "Gasto Op." ||
              row.Detalle === "Devolucion"
            ) {
              saldoDolares += row.Monto;
            }
          } else if (row.Divisa === "ARS") {
            if (row.Detalle === "Compra") {
              saldoPesos -= row.MontoTotal || 0;
            } else if (row.Detalle === "Venta") {
              saldoPesos += row.MontoTotal || 0;
            } else if (
              row.Detalle === "Ingreso Cap." ||
              row.Detalle === "Ingreso Op." ||
              row.Detalle === "Prestamo"
            ) {
              saldoPesos += row.Monto;
            } else if (
              row.Detalle === "Retiro Cap." ||
              row.Detalle === "Gasto Op." ||
              row.Detalle === "Devolucion"
            ) {
              saldoPesos += row.Monto;
            }
          } else if (row.Divisa === "EUR") {
            if (row.Detalle === "Compra") {
              saldoEuros += row.Monto;
              saldoPesos -= row.MontoTotal || 0;
            } else if (row.Detalle === "Venta") {
              saldoEuros -= row.Monto;
              saldoPesos += row.MontoTotal || 0;
            } else if (
              row.Detalle === "Ingreso Cap." ||
              row.Detalle === "Ingreso Op." ||
              row.Detalle === "Prestamo"
            ) {
              saldoEuros += row.Monto;
            } else if (
              row.Detalle === "Retiro Cap." ||
              row.Detalle === "Gasto Op." ||
              row.Detalle === "Devolucion"
            ) {
              saldoEuros += row.Monto;
            }
          }

          row.SaldoPesos = saldoPesos;
          row.SaldoDolares = saldoDolares;
          row.SaldoEuros = saldoEuros;
        });

        setMergedData(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAndMergeData();
  }, []);

  const transformMovimientos = (movimientosData) => {
    return movimientosData.map((movimiento) => ({
      Detalle: movimiento.Detalle,
      Divisa: movimiento.Divisa,
      Monto: movimiento.Monto,
      TipoCambio: undefined,
      MontoTotal: undefined,
      Fecha: movimiento.Fecha,
      SaldoPesos: 0,
      SaldoDolares: 0,
      SaldoEuros: 0,
    }));
  };

  const transformOperaciones = (operacionesData) => {
    return operacionesData.map((operacion) => ({
      Detalle: operacion.Detalle,
      Divisa: operacion.Divisa,
      Monto: operacion.Monto,
      TipoCambio: operacion.TipoCambio,
      MontoTotal: operacion.MontoTotal,
      Fecha: operacion.Fecha,
      SaldoPesos: 0,
      SaldoDolares: 0,
      SaldoEuros: 0,
    }));
  };

  const visibleRows = mergedData;

  const formatCurrency = (value, currencyCode) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxHeight: "500px",
        overflow: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "dark",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "lightgray",
          borderRadius: "5px",
        },
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
          <EnhancedTableHead />
          <TableBody>
            {visibleRows.map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow hover sx={{ cursor: "pointer" }} key={row.Detalle}>
                  <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                    align="center"
                  >
                    {row.Detalle}
                  </TableCell>
                  <TableCell align="center">{row.Divisa}</TableCell>
                  <TableCell align="center">
                    {formatCurrency(row.Monto, row.Divisa)}
                  </TableCell>
                  <TableCell align="center">
                    {row.TipoCambio !== undefined
                      ? formatCurrency(row.TipoCambio, "ARS")
                      : ""}
                  </TableCell>
                  <TableCell align="center">
                    {row.MontoTotal !== undefined
                      ? formatCurrency(row.MontoTotal, "ARS")
                      : ""}
                  </TableCell>
                  <TableCell align="center">{formatDate(row.Fecha)}</TableCell>
                  <TableCell align="center">
                    {formatCurrency(row.SaldoPesos, "ARS")}
                  </TableCell>
                  <TableCell align="center">
                    {formatCurrency(row.SaldoDolares, "USD")}
                  </TableCell>
                  <TableCell align="center">
                    {formatCurrency(row.SaldoEuros, "EUR")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
