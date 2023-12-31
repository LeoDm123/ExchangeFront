import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import serverAPI from "../../api/serverAPI";

const InfoExtraCap = ({ operationStatus }) => {
  const [, setFechaInicio] = useState(null);
  const [, setFechaFin] = useState(null);
  const [diasLaborales, setDiasLaborales] = useState(0);
  const [prestamosARS, setPrestamosARS] = useState(0);
  const [prestamosUSD, setPrestamosUSD] = useState(0);
  const [prestamosEUR, setPrestamosEUR] = useState(0);
  const [ganancia, setGanancia] = useState(0);
  const [capital, setCapital] = useState(0);
  const [porcMensual, setPorcMensual] = useState(0);
  const [fetchError, setFetchError] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tipoCambio, setTipoCambio] = useState(0);
  const [GananciaTotal, setGananciaTotal] = useState(0);
  const [GananciaDiaria, setGananciaDiaria] = useState(0);
  const [currency, setCurrency] = useState({
    Dolares: 0,
    Euros: 0,
    Pesos: 0,
  });

  const fetchCapitalData = async () => {
    try {
      const resp = await serverAPI.get("/cap/obtenerMovimientos");
      const movimientos = resp.data;

      const prestamoMovimientos = movimientos.filter(
        (prestamo) => prestamo.Detalle === "Prestamo"
      );

      const devolucionesMovimientos = movimientos.filter(
        (devolucion) => devolucion.Detalle === "Devolucion"
      );

      let totalPrestamosPesos = 0;
      let totalPrestamosDolares = 0;
      let totalPrestamosEuros = 0;

      let totalDevolucionesPesos = 0;
      let totalDevolucionesDolares = 0;
      let totalDevolucionesEuros = 0;

      prestamoMovimientos.forEach((prestamo) => {
        if (prestamo.Divisa === "ARS") {
          totalPrestamosPesos += prestamo.Monto;
        } else if (prestamo.Divisa === "USD") {
          totalPrestamosDolares += prestamo.Monto;
        } else if (prestamo.Divisa === "EUR") {
          totalPrestamosEuros += prestamo.Monto;
        }
      });

      devolucionesMovimientos.forEach((devolucion) => {
        if (devolucion.Divisa === "ARS") {
          totalDevolucionesPesos += devolucion.Monto;
        } else if (devolucion.Divisa === "USD") {
          totalDevolucionesDolares += devolucion.Monto;
        } else if (devolucion.Divisa === "EUR") {
          totalDevolucionesEuros += devolucion.Monto;
        }
      });

      const totalPrestamos = {
        Pesos: totalPrestamosPesos,
        Dolares: totalPrestamosDolares,
        Euros: totalPrestamosEuros,
      };

      const totalDevoluciones = {
        Pesos: totalDevolucionesPesos,
        Dolares: totalDevolucionesDolares,
        Euros: totalDevolucionesEuros,
      };

      const BalancePesos = totalPrestamos.Pesos + totalDevoluciones.Pesos;
      const BalanceDolares = totalPrestamos.Dolares + totalDevoluciones.Dolares;
      const BalanceEuros = totalPrestamos.Euros + totalDevoluciones.Euros;

      setPrestamosARS(BalancePesos);
      setPrestamosUSD(BalanceDolares);
      setPrestamosEUR(BalanceEuros);

      const MovIngreso = movimientos.filter(
        (ingreso) => ingreso.Detalle === "Ingreso Cap."
      );

      const capital = MovIngreso.reduce((total, ingreso) => {
        if (ingreso.Detalle === "Ingreso Cap.") {
          return total + ingreso.Monto;
        }
        return total;
      }, 0);

      if (capital) {
        setCapital(capital);
      } else {
        console.log("Capital incial igual a 0");
      }
    } catch (error) {
      console.error("Error fetching currency data:", error);
      setFetchError("An error occurred while fetching currency data.");
    }
  };

  function contarDiasLaborables(fechaInicio, fechaFin) {
    let count = 0;
    const currentDate = new Date(fechaInicio);

    while (currentDate <= fechaFin) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }

  const fetchOperationsData = async () => {
    try {
      const resp = await serverAPI.get("/op/obtenerOperaciones");
      const operaciones = resp.data;

      let fechaInicio = new Date();
      let fechaFin = new Date();

      operaciones.forEach((operacion) => {
        const fechaString = operacion.Fecha;
        const fecha = new Date(fechaString);

        if (!fechaInicio || fecha < fechaInicio) {
          fechaInicio = fecha;
        }

        if (!fechaFin || fecha > fechaFin) {
          fechaFin = fecha;
        }
      });

      setFechaInicio(fechaInicio);
      setFechaFin(fechaFin);

      const diasLaborales = contarDiasLaborables(fechaInicio, fechaFin);

      setDiasLaborales(diasLaborales);

      const MovCompra = operaciones.filter(
        (compra) => compra.Detalle === "Compra"
      );

      const totalCompraUSD = MovCompra.reduce(
        (total, compra) => total + compra.MontoTotal / compra.TipoCambio,
        0
      );

      const MovVenta = operaciones.filter((venta) => venta.Detalle === "Venta");

      const totalVentaUSD = MovVenta.reduce(
        (total, venta) => total + venta.Monto,
        0
      );

      const BalanceOp = totalCompraUSD - totalVentaUSD;

      setGanancia(BalanceOp);

      const ultimaCompra = MovVenta.reduce((ultima, compra) => {
        if (!ultima || new Date(compra.Fecha) > new Date(ultima.Fecha)) {
          return compra;
        }
        return ultima;
      }, null);

      if (ultimaCompra) {
        setTipoCambio(ultimaCompra.TipoCambio);
      } else {
        console.log("tipo de cambio igual a 0");
      }
    } catch (error) {
      console.error("Error fetching currency data:", error);
      setFetchError("An error occurred while fetching currency data.");
    }
  };

  const fetchCurrencyData = async () => {
    try {
      const resp = await serverAPI.get("/cap/obtenerDivisas");
      const capital = resp.data;

      setCurrency(capital);
    } catch (error) {
      console.error("Error fetching currency data:", error);
      setFetchError("An error occurred while fetching currency data.");
    }
  };

  useEffect(() => {
    const ValuedPesos = (currency.Pesos - prestamosARS) / tipoCambio;

    const ValuedEuros = (currency.Euros - prestamosEUR) / 1.06;

    const GananciaTotal = ganancia + ValuedPesos + ValuedEuros;
    setGananciaTotal(GananciaTotal);

    const GananciaDiaria =
      diasLaborales > 0 ? GananciaTotal / diasLaborales : 0;
    setGananciaDiaria(GananciaDiaria);

    const PorcentualMensual = (GananciaTotal / capital / diasLaborales) * 20;
    setPorcMensual(PorcentualMensual);
  }, [tipoCambio, currency.Pesos, ganancia, diasLaborales, capital]);

  const formatCurrency = (value, currencyCode) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchCapitalData(),
          fetchOperationsData(),
          fetchCurrencyData(),
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFetchError("An error occurred while fetching data.");
      }
    };

    fetchData();
  }, [operationStatus]);

  return (
    <Grid container sx={{ paddingRight: 1, paddin: 1 }}>
      {dataLoaded ? (
        <div className="w-100">
          <div className="currencies mt-3 justify-content-between">
            <h4>Deuda por prestamos:</h4>
            <div>
              <h4 className="ms-2 text-end">
                {formatCurrency(prestamosARS, "ARS")}
              </h4>
              <h4 className="ms-2 text-end">
                {formatCurrency(prestamosUSD, "USD")}
              </h4>
              <h4 className="ms-2 text-end">
                {formatCurrency(prestamosEUR, "EUR")}
              </h4>
            </div>
          </div>
          <div className="currencies mt-2 justify-content-between">
            <h4>Ganancia:</h4>
            <h4 className="ms-2">{formatCurrency(GananciaTotal, "USD")}</h4>
          </div>
          <div className="currencies mt-2 justify-content-between">
            <h4>Ganancia diaria:</h4>
            <h4 className="ms-2">{formatCurrency(GananciaDiaria, "USD")}</h4>
          </div>
          <div className="currencies mt-2 justify-content-between">
            <h4>Ganancia mensual (%):</h4>
            <h4 className="ms-2">
              {porcMensual.toLocaleString(undefined, {
                style: "percent",
                minimumFractionDigits: 2,
              })}
            </h4>
          </div>
          <div className="currencies mt-2 justify-content-between">
            <h4>Cantidad de días operados:</h4>
            <h4 className="ms-2">{diasLaborales}</h4>
          </div>
          <div className="currencies mt-2 justify-content-between">
            <h4>Tipo de cambio dolarización:</h4>
            <h4 className="ms-2">{formatCurrency(tipoCambio, "ARS")}</h4>
          </div>
          {fetchError && <p>{fetchError}</p>}
        </div>
      ) : (
        <div className="w-100">
          <Skeleton animation="wave" height={60} width="100%">
            <div className="currencies mt-3 justify-content-between">
              <h4>Deuda Prestamos:</h4>
              <h4 className="ms-2">Cargando...</h4>
            </div>
          </Skeleton>
          <Skeleton animation="wave" height={60} width="100%">
            <div className="currencies mt-3 justify-content-between">
              <h4>Ganancia:</h4>
              <h4 className="ms-2">Cargando...</h4>
            </div>
          </Skeleton>
          <Skeleton animation="wave" height={60} width="100%">
            <div className="currencies mt-3 justify-content-between">
              <h4>Ganancia Diaria:</h4>
              <h4 className="ms-2">Cargando...</h4>
            </div>
          </Skeleton>
          <Skeleton animation="wave" height={60} width="100%">
            <div className="currencies mt-3 justify-content-between">
              <h4>Ganancia Mensual (%):</h4>
              <h4 className="ms-2">Cargando...</h4>
            </div>
          </Skeleton>
          {fetchError && <p>{fetchError}</p>}
        </div>
      )}
    </Grid>
  );
};

export default InfoExtraCap;
