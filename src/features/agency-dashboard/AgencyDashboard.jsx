"use client";

import {
  Banknote,
  ClipboardList,
  Download,
  LayoutDashboard,
  List,
  RotateCcw,
  Save,
  Ticket,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
import { empresas, pageTitles, seedCaja, seedCobros, seedTickets } from "./data";
import { exportAsCsv, formatDate, money, monthName, todayISO, uid } from "./utils";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const initialCobro = () => ({
  fecha: todayISO(),
  agencia: "Samagata",
  socio: "",
  mes: "4",
  importe: "",
  factura: "",
  cobrador: "",
  empresa: "San Nicolas",
  estado: "cobrado",
  obs: "",
});

const initialTicket = () => ({
  fecha: todayISO(),
  agencia: "Samagata",
  socio: "",
  mes: "3",
  importe: "",
  ticket: "",
  motivo: "",
  empresa: "San Nicolas",
});

const initialCaja = () => ({
  fecha: todayISO(),
  agencia: "Samagata",
  empresa: "San Nicolas",
  tipo: "ING. FACTURAS",
  importe: "",
  banco: "",
  flujo: "ingreso",
  obs: "",
});

const navGroups = [
  { title: "Analisis", items: [{ page: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Cargar datos",
    items: [
      { page: "form-cobros", label: "Nuevo cobro", icon: Banknote },
      { page: "form-tickets", label: "Ticket devuelto", icon: Ticket },
      { page: "form-caja", label: "Movimiento caja", icon: Wallet },
    ],
  },
  {
    title: "Registros",
    items: [
      { page: "lista-cobros", label: "Ver cobros", icon: List },
      { page: "lista-tickets", label: "Ver tickets", icon: ClipboardList },
      { page: "lista-caja", label: "Ver caja", icon: Wallet },
    ],
  },
];

export default function AgencyDashboard() {
  const [page, setPage] = useState("dashboard");
  const [loaded, setLoaded] = useState(false);
  const [cobros, setCobros] = useState(seedCobros);
  const [tickets, setTickets] = useState(seedTickets);
  const [caja, setCaja] = useState(seedCaja);
  const [cobroForm, setCobroForm] = useState(initialCobro);
  const [ticketForm, setTicketForm] = useState(initialTicket);
  const [cajaForm, setCajaForm] = useState(initialCaja);
  const [alert, setAlert] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [filters, setFilters] = useState({ cobros: "", mes: "", importe: "", cajaEmpresa: "", cajaFlujo: "" });
  const [dateLabel, setDateLabel] = useState("Cargando...");

  useEffect(() => {
    queueMicrotask(() => {
      setDateLabel(new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }));
      setCobros(readStorage("sn_cobros", seedCobros));
      setTickets(readStorage("sn_tickets", seedTickets));
      setCaja(readStorage("sn_caja", seedCaja));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("sn_cobros", JSON.stringify(cobros));
    localStorage.setItem("sn_tickets", JSON.stringify(tickets));
    localStorage.setItem("sn_caja", JSON.stringify(caja));
  }, [caja, cobros, loaded, tickets]);

  useEffect(() => {
    if (!alert) return undefined;
    const timeout = setTimeout(() => setAlert(null), 3600);
    return () => clearTimeout(timeout);
  }, [alert]);

  const totals = useMemo(() => {
    const totalCobros = cobros.reduce((sum, row) => sum + row.importe, 0);
    const totalTickets = tickets.reduce((sum, row) => sum + row.importe, 0);
    const sn = caja.filter((row) => row.empresa === "San Nicolas" && row.flujo === "ingreso").reduce((sum, row) => sum + row.importe, 0);
    const ren = caja.filter((row) => row.empresa === "Renacimiento" && row.flujo === "egreso").reduce((sum, row) => sum + row.importe, 0);
    const net = caja.filter((row) => row.empresa === "Cocheria").reduce((sum, row) => sum + row.importe, 0);
    const max = Math.max(sn, ren, net, totalCobros, totalTickets, 1);
    return { totalCobros, totalTickets, sn, ren, net, max };
  }, [caja, cobros, tickets]);

  const filteredCobros = useMemo(() => {
    const q = filters.cobros.toLowerCase();
    return cobros.filter(
      (row) =>
        (!q || row.socio.toLowerCase().includes(q) || row.factura.includes(q)) &&
        (!filters.mes || Number(row.mes) === Number(filters.mes)) &&
        (!filters.importe || Number(row.importe) === Number(filters.importe)),
    );
  }, [cobros, filters]);

  const filteredCaja = useMemo(
    () => caja.filter((row) => (!filters.cajaEmpresa || row.empresa === filters.cajaEmpresa) && (!filters.cajaFlujo || row.flujo === filters.cajaFlujo)),
    [caja, filters],
  );

  const currentTitle = pageTitles[page] || [page, ""];

  function showAlert(type, text) {
    setAlert({ type, text });
  }

  function saveCobro() {
    if (!cobroForm.socio || !cobroForm.importe || !cobroForm.mes) {
      showAlert("error", "Completa al menos Socio, Mes e Importe.");
      return;
    }
    setCobros((rows) => [...rows, normalizeRecord(cobroForm)]);
    setCobroForm(initialCobro());
    showAlert("success", "Cobro guardado correctamente.");
  }

  function saveTicket() {
    if (!ticketForm.socio || !ticketForm.importe || !ticketForm.mes) {
      showAlert("error", "Completa Socio, Mes e Importe.");
      return;
    }
    setTickets((rows) => [...rows, normalizeRecord(ticketForm)]);
    setTicketForm(initialTicket());
    showAlert("success", "Ticket guardado correctamente.");
  }

  function saveCaja() {
    if (!cajaForm.importe) {
      showAlert("error", "Completa el importe.");
      return;
    }
    setCaja((rows) => [...rows, normalizeRecord(cajaForm)]);
    setCajaForm(initialCaja());
    showAlert("success", "Movimiento guardado.");
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "cobro") setCobros((rows) => rows.filter((row) => row.id !== deleteTarget.id));
    if (deleteTarget.type === "ticket") setTickets((rows) => rows.filter((row) => row.id !== deleteTarget.id));
    if (deleteTarget.type === "caja") setCaja((rows) => rows.filter((row) => row.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function resetAll() {
    localStorage.removeItem("sn_cobros");
    localStorage.removeItem("sn_tickets");
    localStorage.removeItem("sn_caja");
    setCobros(seedCobros);
    setTickets(seedTickets);
    setCaja(seedCaja);
    setResetOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand">San Nicolas</div>
          <div className="sub">Renacimiento · Gestion</div>
          <div className="date-badge">{dateLabel}</div>
        </div>
        <nav className="nav">
          {navGroups.map((group) => (
            <NavGroup key={group.title} group={group} page={page} onNavigate={setPage} />
          ))}
        </nav>
        <div className="sidebar-footer">Agencia Samagata · v1.0</div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{currentTitle[0]}</div>
            <div className="topbar-meta">{currentTitle[1]}</div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => exportAsCsv({ cobros, tickets, caja })}>
              <Download size={14} /> Exportar CSV
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setResetOpen(true)}>
              <X size={14} /> Limpiar datos
            </button>
          </div>
        </div>

        <section className="page">
          {page === "dashboard" && <Dashboard cobros={cobros} tickets={tickets} totals={totals} onNavigate={setPage} />}
          {page === "form-cobros" && (
            <CobroForm form={cobroForm} setForm={setCobroForm} alert={alert} onSave={saveCobro} onClear={() => setCobroForm(initialCobro())} />
          )}
          {page === "form-tickets" && (
            <TicketForm form={ticketForm} setForm={setTicketForm} alert={alert} onSave={saveTicket} onClear={() => setTicketForm(initialTicket())} />
          )}
          {page === "form-caja" && <CajaForm form={cajaForm} setForm={setCajaForm} alert={alert} onSave={saveCaja} onClear={() => setCajaForm(initialCaja())} />}
          {page === "lista-cobros" && (
            <CobrosTable rows={filteredCobros} filters={filters} setFilters={setFilters} onDelete={(id) => setDeleteTarget({ id, type: "cobro" })} />
          )}
          {page === "lista-tickets" && <TicketsTable rows={tickets} onDelete={(id) => setDeleteTarget({ id, type: "ticket" })} />}
          {page === "lista-caja" && (
            <CajaTable rows={filteredCaja} allRows={caja} filters={filters} setFilters={setFilters} onDelete={(id) => setDeleteTarget({ id, type: "caja" })} />
          )}
        </section>
      </main>

      <ConfirmModal open={Boolean(deleteTarget)} title="Eliminar registro?" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete}>
        Esta accion no se puede deshacer.
      </ConfirmModal>
      <ConfirmModal open={resetOpen} danger title="Limpiar todos los datos" onCancel={() => setResetOpen(false)} onConfirm={resetAll}>
        Esto borrara todos los cobros, tickets y movimientos cargados en este navegador.
      </ConfirmModal>
    </div>
  );
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeRecord(record) {
  return {
    ...record,
    id: uid(),
    mes: Number(record.mes),
    importe: Number(record.importe),
    fecha: record.fecha || todayISO(),
    agencia: record.agencia || "Samagata",
  };
}

function NavGroup({ group, page, onNavigate }) {
  return (
    <>
      <div className="nav-section">{group.title}</div>
      {group.items.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.page} className={`nav-item ${page === item.page ? "active" : ""}`} onClick={() => onNavigate(item.page)}>
            <Icon className="nav-icon" />
            {item.label}
          </button>
        );
      })}
    </>
  );
}

function Dashboard({ cobros, tickets, totals, onNavigate }) {
  const recent = [...cobros].slice(-10).reverse();
  const accumulatedData = useMemo(
    () => cobros.reduce((acc, row, index) => [...acc, (acc[index - 1] || 0) + row.importe], []),
    [cobros],
  );
  const importes = cobros.reduce((acc, row) => {
    const key = money(row.importe);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const meses = cobros.reduce((acc, row) => {
    const key = monthName(row.mes);
    acc[key] = (acc[key] || 0) + row.importe;
    return acc;
  }, {});

  return (
    <>
      <div className="kpi-grid">
        <Kpi color="blue" label="Ingresos San Nicolas" value={money(totals.sn)} sub="Cobros del dia" percent={(totals.sn / totals.max) * 100} />
        <Kpi color="red" label="Egresos Renacimiento" value={money(totals.ren)} sub="Movimientos de caja" percent={(totals.ren / totals.max) * 100} />
        <Kpi color="green" label="Neto cocheria" value={money(totals.net)} sub="Cierre del dia" percent={(totals.net / totals.max) * 100} />
        <Kpi color="amber" label="Total cobros" value={money(totals.totalCobros)} sub={`${cobros.length} facturas`} percent={100} />
        <Kpi color="red" label="Tickets devueltos" value={money(totals.totalTickets)} sub={`${tickets.length} tickets`} percent={100} />
        <Kpi color="purple" label="Neto cobros" value={money(totals.totalCobros - totals.totalTickets)} sub="Cobros - tickets" percent={100} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Distribucion por importe">
          <Doughnut data={doughnutData(importes)} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Cobros por mes">
          <Bar data={barData(meses)} options={axisOptions} />
        </ChartCard>
        <ChartCard title="Cobros acumulados (ultimas facturas)" full short>
          <Line
            data={{
              labels: cobros.map((_, index) => `F${index + 1}`),
              datasets: [
                {
                  label: "Acumulado",
                  data: accumulatedData,
                  borderColor: "#2ec98a",
                  pointRadius: 0,
                  fill: true,
                  backgroundColor: "rgba(46,201,138,.07)",
                  tension: 0.4,
                },
              ],
            }}
            options={axisOptions}
          />
        </ChartCard>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <div className="table-header-title">Ultimos cobros cargados</div>
            <div className="table-header-meta">Los 10 mas recientes</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("lista-cobros")}>
            Ver todos
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Socio</th>
                <th>Mes</th>
                <th>Agencia</th>
                <th>Cobrador</th>
                <th className="num">Importe</th>
                <th>Factura</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.socio}</strong></td>
                  <td>{monthName(row.mes)}</td>
                  <td>{row.agencia || "-"}</td>
                  <td>{row.cobrador || "-"}</td>
                  <td className="num text-green">{money(row.importe)}</td>
                  <td><span className="badge badge-blue">{row.factura}</span></td>
                  <td><StatusBadge value={row.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Kpi({ color, label, value, sub, percent }) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
      <div className="kpi-bar">
        <div className="kpi-bar-fill" style={{ width: `${Math.round(percent)}%`, background: `var(--${color})` }} />
      </div>
    </div>
  );
}

function ChartCard({ title, children, full, short }) {
  return (
    <div className={`chart-card ${full ? "full" : ""}`}>
      <div className="chart-title">{title}</div>
      <div className={`chart-wrap ${short ? "short" : ""}`}>{children}</div>
    </div>
  );
}

function CobroForm({ form, setForm, alert, onSave, onClear }) {
  return (
    <FormShell title="Cargar nuevo cobro" icon={<Banknote size={18} color="var(--blue)" />} alert={alert}>
      <div className="form-grid">
        <Field label="Fecha" type="date" name="fecha" form={form} setForm={setForm} />
        <Field label="Agencia" name="agencia" form={form} setForm={setForm} placeholder="Ej: Samagata" />
        <Field label="Nro Socio" name="socio" form={form} setForm={setForm} placeholder="Ej: 893206" />
        <MonthSelect label="Mes cobrado" name="mes" form={form} setForm={setForm} />
        <Field label="Importe ($)" type="number" name="importe" form={form} setForm={setForm} placeholder="Ej: 33000" />
        <Field label="Nro Factura" name="factura" form={form} setForm={setForm} placeholder="Ej: 26" />
        <Field label="Cobrador" name="cobrador" form={form} setForm={setForm} placeholder="Ej: Juana Romero" />
        <Select label="Empresa" name="empresa" form={form} setForm={setForm} options={["San Nicolas", "Renacimiento"]} />
        <Select label="Estado" name="estado" form={form} setForm={setForm} options={["cobrado", "pendiente", "anulado"]} />
        <Field label="Observaciones" name="obs" form={form} setForm={setForm} placeholder="Opcional..." />
      </div>
      <FormActions onSave={onSave} onClear={onClear} label="Guardar cobro" />
    </FormShell>
  );
}

function TicketForm({ form, setForm, alert, onSave, onClear }) {
  return (
    <FormShell title="Cargar ticket devuelto" icon={<Ticket size={18} color="var(--red)" />} alert={alert}>
      <div className="form-grid">
        <Field label="Fecha" type="date" name="fecha" form={form} setForm={setForm} />
        <Field label="Agencia" name="agencia" form={form} setForm={setForm} placeholder="Ej: Samagata" />
        <Field label="Nro Socio" name="socio" form={form} setForm={setForm} placeholder="Ej: 889932" />
        <MonthSelect label="Mes" name="mes" form={form} setForm={setForm} />
        <Field label="Importe ($)" type="number" name="importe" form={form} setForm={setForm} placeholder="Ej: 28000" />
        <Field label="Nro Ticket" name="ticket" form={form} setForm={setForm} placeholder="Ej: 20" />
        <Field label="Motivo devolucion" name="motivo" form={form} setForm={setForm} placeholder="Ej: Socio ausente" />
        <Select label="Empresa" name="empresa" form={form} setForm={setForm} options={["San Nicolas", "Renacimiento"]} />
      </div>
      <FormActions onSave={onSave} onClear={onClear} label="Guardar ticket" />
    </FormShell>
  );
}

function CajaForm({ form, setForm, alert, onSave, onClear }) {
  return (
    <FormShell title="Movimiento de caja" icon={<Wallet size={18} color="var(--green)" />} alert={alert}>
      <div className="form-grid">
        <Field label="Fecha" type="date" name="fecha" form={form} setForm={setForm} />
        <Field label="Agencia" name="agencia" form={form} setForm={setForm} placeholder="Ej: Samagata" />
        <Select label="Empresa" name="empresa" form={form} setForm={setForm} options={empresas} />
        <Select label="Tipo de movimiento" name="tipo" form={form} setForm={setForm} options={["ING. FACTURAS", "ING. POSNET", "ING. TRANSFERENCIA", "ING. TICKET", "DEPOSITO", "EGRESO", "CIERRE DIA"]} />
        <Field label="Importe ($)" type="number" name="importe" form={form} setForm={setForm} placeholder="Ej: 1078500" />
        <Field label="Banco (opcional)" name="banco" form={form} setForm={setForm} placeholder="Ej: Galicia" />
        <Select label="Tipo flujo" name="flujo" form={form} setForm={setForm} options={["ingreso", "egreso"]} />
        <Field label="Observaciones" name="obs" form={form} setForm={setForm} placeholder="Opcional..." />
      </div>
      <FormActions onSave={onSave} onClear={onClear} label="Guardar movimiento" />
    </FormShell>
  );
}

function FormShell({ title, icon, alert, children }) {
  return (
    <div className="form-page">
      {alert && <div className={`form-alert ${alert.type}`}>{alert.text}</div>}
      <div className="form-card">
        <div className="form-card-title">{icon}{title}</div>
        {children}
      </div>
    </div>
  );
}

function FormActions({ onSave, onClear, label }) {
  return (
    <>
      <div className="divider" />
      <div className="form-actions">
        <button className="btn btn-primary" onClick={onSave}><Save size={14} /> {label}</button>
        <button className="btn btn-ghost" onClick={onClear}><RotateCcw size={14} /> Limpiar</button>
      </div>
    </>
  );
}

function Field({ label, name, form, setForm, type = "text", placeholder }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} min={type === "number" ? "0" : undefined} value={form[name]} placeholder={placeholder} onChange={(event) => setForm({ ...form, [name]: event.target.value })} />
    </div>
  );
}

function Select({ label, name, form, setForm, options }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function MonthSelect(props) {
  return <Select {...props} options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]} />;
}

function CobrosTable({ rows, filters, setFilters, onDelete }) {
  const total = rows.reduce((sum, row) => sum + row.importe, 0);
  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <div className="table-header-title">Cobros registrados</div>
          <div className="table-header-meta">{rows.length} registros · Total: {money(total)}</div>
        </div>
        <div className="table-controls">
          <input className="search-input" value={filters.cobros} onChange={(event) => setFilters({ ...filters, cobros: event.target.value })} placeholder="Buscar socio..." />
          <FilterSelect value={filters.mes} onChange={(mes) => setFilters({ ...filters, mes })} empty="Todos los meses" options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]} />
          <FilterSelect value={filters.importe} onChange={(importe) => setFilters({ ...filters, importe })} empty="Todos los importes" options={["25000", "28000", "30000", "33000", "38500", "43000"]} format={money} />
        </div>
      </div>
      <DataTable headers={["#", "Fecha", "Socio", "Mes", "Agencia", "Cobrador", "Empresa", "Importe", "Factura", "Estado", ""]}>
        {rows.length ? rows.map((row, index) => (
          <tr key={row.id}>
            <td className="text-muted">{index + 1}</td>
            <td>{formatDate(row.fecha)}</td>
            <td><strong>{row.socio}</strong></td>
            <td>{monthName(row.mes)}</td>
            <td>{row.agencia || "-"}</td>
            <td>{row.cobrador || "-"}</td>
            <td>{row.empresa}</td>
            <td className="num text-green">{money(row.importe)}</td>
            <td><span className="badge badge-blue">{row.factura}</span></td>
            <td><StatusBadge value={row.estado} /></td>
            <td><DeleteButton onClick={() => onDelete(row.id)} /></td>
          </tr>
        )) : <EmptyRow colSpan={11} text="No hay cobros que coincidan." />}
        <tr>
          <td colSpan="7"><strong>Total</strong></td>
          <td className="num"><strong>{money(total)}</strong></td>
          <td colSpan="3" />
        </tr>
      </DataTable>
    </div>
  );
}

function TicketsTable({ rows, onDelete }) {
  const total = rows.reduce((sum, row) => sum + row.importe, 0);
  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <div className="table-header-title">Tickets devueltos</div>
          <div className="table-header-meta">{rows.length} tickets · Total: {money(total)}</div>
        </div>
      </div>
      <DataTable headers={["Fecha", "Socio", "Mes", "Empresa", "Importe", "Ticket Nro", "Motivo", ""]}>
        {rows.length ? rows.map((row) => (
          <tr key={row.id}>
            <td>{formatDate(row.fecha)}</td>
            <td><strong>{row.socio}</strong></td>
            <td>{monthName(row.mes)}</td>
            <td>{row.empresa}</td>
            <td className="num text-red">{money(row.importe)}</td>
            <td><span className="badge badge-amber">#{row.ticket}</span></td>
            <td className="text-muted">{row.motivo || "-"}</td>
            <td><DeleteButton onClick={() => onDelete(row.id)} /></td>
          </tr>
        )) : <EmptyRow colSpan={8} text="No hay tickets devueltos." />}
      </DataTable>
    </div>
  );
}

function CajaTable({ rows, allRows, filters, setFilters, onDelete }) {
  const neto = rows.reduce((sum, row) => sum + (row.flujo === "ingreso" ? row.importe : -row.importe), 0);
  return (
    <>
      <div className="caja-grid">
        {empresas.map((empresa) => {
          const movs = allRows.filter((row) => row.empresa === empresa);
          const ing = movs.filter((row) => row.flujo === "ingreso").reduce((sum, row) => sum + row.importe, 0);
          const eg = movs.filter((row) => row.flujo === "egreso").reduce((sum, row) => sum + row.importe, 0);
          return (
            <div className="caja-card" key={empresa}>
              <div className="caja-empresa">{empresa}</div>
              <div className="caja-tipo">Ingresos</div>
              <div className="caja-monto text-green">{money(ing)}</div>
              <div className="caja-tipo">Egresos</div>
              <div className="caja-monto text-red">{money(eg)}</div>
            </div>
          );
        })}
      </div>
      <div className="table-card">
        <div className="table-header">
          <div>
            <div className="table-header-title">Movimientos de caja</div>
            <div className="table-header-meta">{rows.length} movimientos</div>
          </div>
          <div className="table-controls">
            <FilterSelect value={filters.cajaEmpresa} onChange={(cajaEmpresa) => setFilters({ ...filters, cajaEmpresa })} empty="Todas las empresas" options={empresas} />
            <FilterSelect value={filters.cajaFlujo} onChange={(cajaFlujo) => setFilters({ ...filters, cajaFlujo })} empty="Ingresos y egresos" options={["ingreso", "egreso"]} />
          </div>
        </div>
        <DataTable headers={["Fecha", "Empresa", "Agencia", "Tipo", "Banco", "Flujo", "Importe", ""]}>
          {rows.length ? rows.map((row) => (
            <tr key={row.id}>
              <td>{formatDate(row.fecha)}</td>
              <td>{row.empresa}</td>
              <td>{row.agencia || "-"}</td>
              <td className="text-muted">{row.tipo}</td>
              <td className="text-muted">{row.banco || "-"}</td>
              <td><span className={`badge ${row.flujo === "ingreso" ? "badge-green" : "badge-red"}`}>{row.flujo}</span></td>
              <td className={`num ${row.flujo === "ingreso" ? "text-green" : "text-red"}`}>{row.flujo === "egreso" ? "-" : ""}{money(row.importe)}</td>
              <td><DeleteButton onClick={() => onDelete(row.id)} /></td>
            </tr>
          )) : <EmptyRow colSpan={8} text="No hay movimientos." />}
          <tr>
            <td colSpan="5" />
            <td><strong>Neto</strong></td>
            <td className="num"><strong>{neto < 0 ? "-" : ""}{money(Math.abs(neto))}</strong></td>
            <td />
          </tr>
        </DataTable>
      </div>
    </>
  );
}

function DataTable({ headers, children }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header} className={header === "Importe" ? "num" : ""}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function FilterSelect({ value, onChange, empty, options, format = (value) => value }) {
  return (
    <select className="filter-select" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{empty}</option>
      {options.map((option) => <option key={option} value={option}>{format(option)}</option>)}
    </select>
  );
}

function StatusBadge({ value }) {
  const klass = value === "cobrado" ? "badge-green" : value === "pendiente" ? "badge-amber" : value === "anulado" ? "badge-red" : "badge-blue";
  return <span className={`badge ${klass}`}>{value}</span>;
}

function DeleteButton({ onClick }) {
  return <button className="row-del" onClick={onClick} aria-label="Eliminar"><Trash2 size={14} /></button>;
}

function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="empty">{text}</td>
    </tr>
  );
}

function ConfirmModal({ open, title, children, onCancel, onConfirm, danger }) {
  return (
    <div className={`modal-backdrop ${open ? "open" : ""}`}>
      <div className="modal-box">
        <div className="modal-title" style={{ color: danger ? "var(--red)" : undefined }}>{title}</div>
        <p className="modal-copy">{children}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>{danger ? "Si, limpiar todo" : "Eliminar"}</button>
        </div>
      </div>
    </div>
  );
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, position: "right", labels: { color: "#8e99b5", font: { size: 11 }, boxWidth: 10, padding: 8 } } },
};

const axisOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: "#596175", font: { size: 10 } }, grid: { color: "rgba(42,51,74,.5)" } },
    y: { ticks: { color: "#596175", font: { size: 10 }, callback: (value) => `$${Math.round(value / 1000)}k` }, grid: { color: "rgba(42,51,74,.5)" } },
  },
};

function doughnutData(values) {
  return {
    labels: Object.keys(values),
    datasets: [{ data: Object.values(values), backgroundColor: ["#3d8ef8", "#2ec98a", "#f59e0b", "#f05252", "#a78bfa", "#38bdf8"], borderWidth: 0 }],
  };
}

function barData(values) {
  return {
    labels: Object.keys(values),
    datasets: [{ label: "Cobrado", data: Object.values(values), backgroundColor: "#3d8ef8", borderRadius: 4 }],
  };
}
