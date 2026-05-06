import { uid } from "./utils";

const cobroSocios = [
  ["849", 33000, "01"],
  ["6489", 33000, "02"],
  ["6499", 30000, "03"],
  ["6499", 33000, "04"],
  ["7315", 25000, "05"],
  ["834866", 43000, "06"],
  ["835036", 43000, "07"],
  ["835325", 38500, "08"],
  ["836094", 33000, "09"],
  ["840357", 33000, "10"],
  ["842303", 28000, "11"],
  ["846781", 33000, "12"],
  ["850636", 33000, "13"],
  ["861342", 28000, "14"],
  ["867318", 33000, "15"],
  ["871833", 33000, "16"],
  ["889932", 28000, "17"],
  ["893206", 33000, "18"],
  ["897670", 33000, "29"],
  ["899241", 33000, "30"],
  ["899671", 43000, "31"],
  ["899836", 28000, "32"],
  ["904797", 28000, "33"],
  ["904936", 28000, "34"],
  ["905695", 28000, "35"],
  ["907254", 43000, "36"],
  ["909012", 28000, "37"],
  ["911731", 33000, "38"],
  ["912302", 33000, "39"],
  ["140612", 33000, "40"],
];

export const seedCobros = cobroSocios.map(([socio, importe, factura]) => ({
  id: uid(),
  fecha: "2026-04-29",
  agencia: "Samagata",
  socio,
  mes: 4,
  importe,
  factura,
  cobrador: "Juana Romero",
  empresa: "San Nicolas",
  estado: "cobrado",
  obs: "",
}));

export const seedTickets = [
  { id: uid(), fecha: "2026-04-29", agencia: "Samagata", socio: "889932", mes: 3, importe: 28000, ticket: "20", motivo: "", empresa: "San Nicolas" },
  { id: uid(), fecha: "2026-04-29", agencia: "Samagata", socio: "889932", mes: 4, importe: 28000, ticket: "21", motivo: "", empresa: "San Nicolas" },
  { id: uid(), fecha: "2026-04-29", agencia: "Samagata", socio: "913442", mes: 3, importe: 33000, ticket: "36", motivo: "", empresa: "San Nicolas" },
  { id: uid(), fecha: "2026-04-29", agencia: "Samagata", socio: "913442", mes: 4, importe: 39000, ticket: "37", motivo: "", empresa: "San Nicolas" },
];

export const seedCaja = [
  { id: uid(), fecha: "2026-04-29", agencia: "Samagata", empresa: "San Nicolas", tipo: "ING. FACTURAS", banco: "", flujo: "ingreso", importe: 1078500, obs: "" },
  { id: uid(), fecha: "2026-04-29", agencia: "Samagata", empresa: "Renacimiento", tipo: "EGRESO", banco: "", flujo: "egreso", importe: 176850, obs: "" },
  { id: uid(), fecha: "2026-04-29", agencia: "Samagata", empresa: "Cocheria", tipo: "CIERRE DIA", banco: "", flujo: "ingreso", importe: 901650, obs: "" },
];

export const pageTitles = {
  dashboard: ["Dashboard", "Resumen general del dia"],
  "form-cobros": ["Nuevo cobro", "Cargar un cobro manualmente"],
  "form-tickets": ["Ticket devuelto", "Registrar un ticket devuelto"],
  "form-caja": ["Movimiento de caja", "Ingresos y egresos de caja"],
  "lista-cobros": ["Cobros registrados", "Todos los cobros cargados"],
  "lista-tickets": ["Tickets devueltos", "Listado de tickets devueltos"],
  "lista-caja": ["Movimientos de caja", "Historial completo de caja"],
};

export const empresas = ["San Nicolas", "Renacimiento", "Cocheria"];
