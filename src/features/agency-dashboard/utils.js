export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function money(value) {
  return `$${Math.round(Number(value) || 0).toLocaleString("es-AR")}`;
}

export function monthName(month) {
  return ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][
    Number(month)
  ] || month;
}

export function longMonthName(month) {
  return [
    "",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ][Number(month)] || month;
}

export function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function exportAsCsv({ cobros, tickets, caja }) {
  let csv = "COBROS\nFecha,Socio,Mes,Agencia,Cobrador,Empresa,Importe,Factura,Estado\n";
  csv += cobros
    .map((row) =>
      [row.fecha, row.socio, row.mes, row.agencia, row.cobrador, row.empresa, row.importe, row.factura, row.estado].join(","),
    )
    .join("\n");
  csv += "\n\nTICKETS DEVUELTOS\nFecha,Socio,Mes,Empresa,Importe,Ticket,Motivo\n";
  csv += tickets.map((row) => [row.fecha, row.socio, row.mes, row.empresa, row.importe, row.ticket, row.motivo].join(",")).join("\n");
  csv += "\n\nMOVIMIENTOS CAJA\nFecha,Empresa,Agencia,Tipo,Flujo,Importe\n";
  csv += caja.map((row) => [row.fecha, row.empresa, row.agencia, row.tipo, row.flujo, row.importe].join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "san_nicolas_datos.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}
