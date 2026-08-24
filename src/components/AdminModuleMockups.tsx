import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Download, 
  Eye, 
  FileText, 
  TrendingUp, 
  User, 
  Truck, 
  DollarSign, 
  RefreshCw, 
  Calendar, 
  ShieldCheck,
  Lock,
  ExternalLink,
  Globe,
  Key,
  Copy,
  Check
} from "lucide-react";

interface MockupsProps {
  moduleName: string;
}

export function AdminModuleMockups({ moduleName }: MockupsProps) {
  // Facturacion Rapida State
  const [fastItems, setFastItems] = useState([
    { id: 1, desc: "Servicio de Asesoría Contable mensual", cant: 1, precio: 150.00 },
    { id: 2, desc: "Soporte de Implementación de Sistemas", cant: 1, precio: 75.00 },
  ]);
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  
  // Facturacion Administrativa State
  const [searchInvoice, setSearchInvoice] = useState("");
  const invoices = [
    { num: "001-001-000003429", cliente: "Corporación El Rosado S.A.", fecha: "2026-07-20", total: 450.80, estado: "Autorizado" },
    { num: "001-001-000003428", cliente: "Distribuidora Industrial Alva", fecha: "2026-07-19", total: 1120.00, estado: "Autorizado" },
    { num: "001-001-000003427", cliente: "Constructora Andes Verde", fecha: "2026-07-18", total: 3200.00, estado: "Autorizado" },
    { num: "001-001-000003426", cliente: "Tech Solutions Ecuador", fecha: "2026-07-17", total: 85.00, estado: "Borrador" },
    { num: "001-001-000003425", cliente: "Clínica de Especialidades Guayaquil", fecha: "2026-07-15", total: 630.00, estado: "Anulado" },
  ];

  // Contratos State
  const [contracts, setContracts] = useState([
    { id: 1, cliente: "Inmobiliaria Guayas S.A.", plan: "Plan ERP Plus", monto: 600.00, periodo: "Mensual", activo: true },
    { id: 2, cliente: "Estudio Contable Romero & Asociados", plan: "Plan Aliado 10 Empresas", monto: 200.00, periodo: "Mensual", activo: true },
    { id: 3, cliente: "Servicios Médicos Integra", plan: "Plan Up Power", monto: 55.00, periodo: "Mensual", activo: false },
    { id: 4, cliente: "Hotel Oro Verde Manta", plan: "Plan ERP Premium", monto: 10355.25, periodo: "Anual", activo: true },
  ]);

  // Liquidacion de Compras State
  const [liqProv, setLiqProv] = useState("Rosa María Chimbo");
  const [liqMonto, setLiqMonto] = useState(120.00);
  const [liqRentPct, setLiqRentPct] = useState(2); // 2% o 1.75% o 8%
  const [liqIvaPct, setLiqIvaPct] = useState(100); // 100% de retención de IVA

  // Acceso al Sistema Real (LocalStorage Session Persistence with Pre-filled credentials)
  const [upContaRuc, setUpContaRuc] = useState("0987654321001");
  const [upContaUser, setUpContaUser] = useState("Prueba");
  const [upContaPass, setUpContaPass] = useState("tcR00HddPUiXUiC");
  const [isLoggedInToUpConta, setIsLoggedInToUpConta] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedRuc, setCopiedRuc] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const addFastItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || isNaN(parseFloat(newPrice))) return;
    setFastItems([
      ...fastItems,
      {
        id: Date.now(),
        desc: newDesc,
        cant: 1,
        precio: parseFloat(newPrice)
      }
    ]);
    setNewDesc("");
    setNewPrice("");
  };

  const removeFastItem = (id: number) => {
    setFastItems(fastItems.filter(item => item.id !== id));
  };

  const toggleContract = (id: number) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, activo: !c.activo } : c));
  };

  // Calculations for Facturacion Rapida
  const fastSubtotal = fastItems.reduce((acc, item) => acc + (item.precio * item.cant), 0);
  const fastIva = fastSubtotal * 0.15; // 15% IVA Ecuador
  const fastTotal = fastSubtotal + fastIva;

  // Render POS Mockup using the generated image
  if (moduleName === "Punto de venta") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-t-xl border-b border-slate-200">
          <div>
            <h5 className="font-bold text-slate-800 text-sm">UPCONTA TPV - PUNTO DE VENTA</h5>
            <p className="text-xs text-slate-500">Terminal de Venta Rápida y Facturación Electrónica</p>
          </div>
          <span className="bg-orange-500/10 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-200">
            Módulo Integrado
          </span>
        </div>
        
        {/* Dynamic Interactive POS Mockup Header */}
        <div className="border border-slate-200 rounded-b-xl overflow-hidden bg-white p-4 relative shadow-sm">
          <img 
            src="/src/assets/images/punto_de_venta_visual_1784654514665.jpg" 
            alt="Punto de Venta" 
            className="w-full h-auto rounded-lg shadow border border-slate-200 object-cover max-h-[350px]"
            referrerPolicy="no-referrer"
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mb-1">Caja Chica y Turnos</span>
              <p className="text-slate-600">Apertura y cierre de turnos, arqueos de caja en efectivo y transferencias, control de sobrantes y faltantes.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mb-1">Múltiples Formas de Pago</span>
              <p className="text-slate-600">Soporte para efectivo, tarjetas de crédito, depósitos, transferencias y billeteras digitales, homologado con el SRI.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mb-1">Modo Offline</span>
              <p className="text-slate-600">Sigue facturando sin conexión a internet. Los datos se sincronizan y se autorizan en el SRI de forma automática al recuperar la señal.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Facturacion Rapida
  if (moduleName === "Facturación rápida") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-t-xl border-b border-slate-200">
          <div>
            <h5 className="font-bold text-slate-800 text-sm">FACTURACIÓN RÁPIDA (EMISOR EXPRESS)</h5>
            <p className="text-xs text-slate-500">Emisión de facturas electrónicas en menos de 10 segundos</p>
          </div>
          <span className="bg-orange-500/10 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-200">
            Modo Simulador
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-b-xl p-4 space-y-4 shadow-sm">
          <form onSubmit={addFastItem} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input 
              type="text" 
              placeholder="Descripción del ítem (p. ej. Honorarios)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 sm:col-span-2"
            />
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Precio ($)"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                className="bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 w-full"
              />
              <button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Added items list */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-2">Descripción</th>
                  <th className="p-2 text-center w-16">Cant</th>
                  <th className="p-2 text-right w-24">Precio Unit</th>
                  <th className="p-2 text-right w-24">Total</th>
                  <th className="p-2 text-center w-12">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fastItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-2 font-medium">{item.desc}</td>
                    <td className="p-2 text-center text-slate-500">{item.cant}</td>
                    <td className="p-2 text-right">${item.precio.toFixed(2)}</td>
                    <td className="p-2 text-right font-semibold">${(item.precio * item.cant).toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => removeFastItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {fastItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400 italic">No hay ítems agregados a la factura rápida.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals and Emit Button */}
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-1 font-medium"><ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Firma electrónica EC integrada</p>
              <p>Envío automático al SRI y correo electrónico del cliente</p>
            </div>
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Neto:</span>
                <span className="font-semibold text-slate-700">${fastSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA (15%):</span>
                <span className="font-semibold text-slate-700">${fastIva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-800 border-t border-slate-200 pt-1.5 font-extrabold text-sm">
                <span>TOTAL COMPROBANTE:</span>
                <span className="text-orange-600">${fastTotal.toFixed(2)}</span>
              </div>
              <button 
                type="button"
                onClick={() => alert("¡Simulación Exitosa! El comprobante ha sido generado con firma digital y transmitido al SRI de pruebas de UpConta.")}
                className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded text-xs transition-all shadow-md shadow-orange-100 cursor-pointer text-center block"
              >
                Autorizar Comprobante (SRI)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Facturacion Administrativa
  if (moduleName === "Facturación administrativa") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-t-xl border-b border-slate-200">
          <div>
            <h5 className="font-bold text-slate-800 text-sm">DASHBOARD DE FACTURACIÓN ADMINISTRATIVA</h5>
            <p className="text-xs text-slate-500">Control global de compras, ventas y estados de comprobantes</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-orange-500/10 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-200 flex items-center gap-1">
              SRI En Línea
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-b-xl p-4 space-y-4 shadow-sm">
          {/* Quick Filter search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, RUC o número de proforma/factura..."
              value={searchInvoice}
              onChange={e => setSearchInvoice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Invoice grid / list */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-2.5">N° Comprobante</th>
                  <th className="p-2.5">Cliente</th>
                  <th className="p-2.5 w-24">Fecha</th>
                  <th className="p-2.5 text-right w-24">Monto</th>
                  <th className="p-2.5 text-center w-28">Estado SRI</th>
                  <th className="p-2.5 text-center w-24">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices
                  .filter(inv => 
                    inv.cliente.toLowerCase().includes(searchInvoice.toLowerCase()) ||
                    inv.num.includes(searchInvoice)
                  )
                  .map(inv => (
                    <tr key={inv.num} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono text-[11px] text-slate-800">{inv.num}</td>
                      <td className="p-2.5 font-medium">{inv.cliente}</td>
                      <td className="p-2.5 text-slate-500">{inv.fecha}</td>
                      <td className="p-2.5 text-right font-semibold text-slate-800">${inv.total.toFixed(2)}</td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          inv.estado === "Autorizado" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : inv.estado === "Borrador"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {inv.estado}
                        </span>
                      </td>
                      <td className="p-2.5 text-center flex items-center justify-center gap-1.5">
                        <button className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer" title="Ver PDF">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer" title="Descargar XML">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200">
            <span>Sincronización automatizada con la base de datos de UpConta</span>
            <span className="font-semibold text-slate-600">Total Facturas Filtradas: {invoices.length}</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Contratos o Facturacion Recurrente
  if (moduleName === "Contratos / Recurrentes" || moduleName === "Contratos o facturación recurrente") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-t-xl border-b border-slate-200">
          <div>
            <h5 className="font-bold text-slate-800 text-sm">PLANIFICADOR DE FACTURACIÓN RECURRENTE Y CONTRATOS</h5>
            <p className="text-xs text-slate-500">Generación de lotes de facturación automatizada para suscripciones y membresías</p>
          </div>
          <span className="bg-orange-500/10 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-200">
            Frecuencia Configurable
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-b-xl p-4 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Contratos Activos</span>
                <span className="text-sm font-bold text-slate-800">{contracts.filter(c => c.activo).length} de {contracts.length}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Recurrencia Mensual</span>
                <span className="text-sm font-bold text-slate-800">
                  ${contracts.filter(c => c.activo && c.periodo === "Mensual").reduce((acc, c) => acc + c.monto, 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Próximo Lote</span>
                <span className="text-xs font-bold text-slate-800">01-Agosto-2026</span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Tasa de Retención</span>
                <span className="text-sm font-bold text-slate-800">96.8%</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-2.5">Cliente Suscriptor</th>
                  <th className="p-2.5">Plan / Servicio</th>
                  <th className="p-2.5 text-center">Frecuencia</th>
                  <th className="p-2.5 text-right">Monto Unit.</th>
                  <th className="p-2.5 text-center w-24">Estado</th>
                  <th className="p-2.5 text-center w-28">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {contracts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-medium">{c.cliente}</td>
                    <td className="p-2.5 text-slate-500">{c.plan}</td>
                    <td className="p-2.5 text-center">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
                        {c.periodo}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-semibold text-slate-800">${c.monto.toFixed(2)}</td>
                    <td className="p-2.5 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        c.activo ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {c.activo ? "Ejecutando" : "Pausado"}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button 
                        onClick={() => toggleContract(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          c.activo 
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {c.activo ? "Pausar" : "Reactivar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render Guias de Remision
  if (moduleName === "Guías de remisión" || moduleName === "Guias de remision") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-t-xl border-b border-slate-200">
          <div>
            <h5 className="font-bold text-slate-800 text-sm">CREADOR DE GUÍAS DE REMISIÓN ELECTRÓNICAS</h5>
            <p className="text-xs text-slate-500">Documentación de traslado de mercancías con validación automática del transportista</p>
          </div>
          <span className="bg-orange-500/10 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-200">
            Regulado por SRI
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-b-xl p-4 space-y-4 text-xs shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
              <h6 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-orange-500" /> Datos del Transportista y Vehículo
              </h6>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">Nombre Conductor:</label>
                  <input type="text" defaultValue="Carlos Humberto Mina" className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">RUC / Cédula:</label>
                  <input type="text" defaultValue="1712415121001" className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 font-mono focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">Placa Vehículo:</label>
                  <input type="text" defaultValue="PBX-4289" className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 font-mono focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">Tipo de Vehículo:</label>
                  <input type="text" defaultValue="Camión Isuzu 3.5 Tn" className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500" />
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
              <h6 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-500" /> Ruta, Destinatario y Traslado
              </h6>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">Cliente Destinatario:</label>
                  <input type="text" defaultValue="Consorcio Vial Oro Negro S.A." className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">Punto Partida:</label>
                  <input type="text" defaultValue="Bodega Central UpConta, Quito" className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">Punto Destino:</label>
                  <input type="text" defaultValue="Obra Campamento, Esmeraldas" className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">Fecha Inicio:</label>
                  <input type="date" defaultValue="2026-07-21" className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block mb-1 font-bold">Motivo Traslado:</label>
                  <input type="text" defaultValue="Venta de Materiales" className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-slate-500 text-[11px]">Se requiere asociar una Factura Electrónica previa para validar el contenido transportado.</span>
            <button 
              type="button"
              onClick={() => alert("¡Guía de Remisión Generada! Comprobante XML firmado electrónicamente y notificado al SRI para emisión de guía de ruta legal.")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded text-xs transition-all cursor-pointer shadow-md shadow-orange-100"
            >
              Emitir Guía de Remisión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Liquidacion de Compras
  if (moduleName === "Liquidación de compras") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-t-xl border-b border-slate-200">
          <div>
            <h5 className="font-bold text-slate-800 text-sm">EMISOR DE LIQUIDACIONES DE COMPRAS Y RETENCIONES</h5>
            <p className="text-xs text-slate-500">Formalización de compras a artesanos, agricultores o personas no obligadas a emitir facturas</p>
          </div>
          <span className="bg-orange-500/10 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-200">
            Con Retención Integrada
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-b-xl p-4 space-y-4 text-xs shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block border-b border-slate-200 pb-1.5">Proveedor Externo</span>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Nombre / Razón Social:</label>
                <input 
                  type="text" 
                  value={liqProv}
                  onChange={e => setLiqProv(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500" 
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Monto de la Compra ($):</label>
                <input 
                  type="number" 
                  value={liqMonto}
                  onChange={e => setLiqMonto(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 font-mono focus:outline-none focus:border-orange-500" 
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block border-b border-slate-200 pb-1.5">Retención Impuesto Renta</span>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold font-bold">Porcentaje de Retención:</label>
                <select 
                  value={liqRentPct} 
                  onChange={e => setLiqRentPct(parseFloat(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value={1.75}>1.75% (Bienes y Servicios generales)</option>
                  <option value={2}>2.00% (Servicios mano de obra / fletes)</option>
                  <option value={8}>8.00% (Honorarios profesionales personas naturales)</option>
                  <option value={10}>10.00% (Arrendamiento de inmuebles)</option>
                </select>
              </div>
              <div className="pt-1.5 flex justify-between text-slate-500 text-[11px] font-medium">
                <span>Monto a Retener IR:</span>
                <span className="font-bold text-red-600">-${(liqMonto * (liqRentPct / 100)).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block border-b border-slate-200 pb-1.5">Retención de IVA</span>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Porcentaje Retención IVA:</label>
                <select 
                  value={liqIvaPct} 
                  onChange={e => setLiqIvaPct(parseFloat(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value={100}>100% de Retención del IVA (Servicios / Bienes)</option>
                  <option value={30}>30% de Retención (Bienes a personas naturales)</option>
                  <option value={70}>70% de Retención (Servicios a profesionales)</option>
                </select>
              </div>
              <div className="pt-1.5 flex justify-between text-slate-500 text-[11px] font-medium">
                <span>Monto Retener IVA (15%):</span>
                <span className="font-bold text-red-600">-${(liqMonto * 0.15 * (liqIvaPct / 100)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Liquidacion Payout summary */}
          <div className="bg-slate-100 p-3 rounded border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 mt-3">
            <div className="text-slate-800 text-center sm:text-left">
              <p className="font-bold text-slate-800">Resumen de Liquidación de Compras</p>
              <p className="text-slate-500 text-[11px]">Subtotal: ${liqMonto.toFixed(2)} | Retenciones Totales: ${(liqMonto * (liqRentPct / 100) + liqMonto * 0.15 * (liqIvaPct / 100)).toFixed(2)}</p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div className="text-xs font-semibold text-slate-600">
                <span>Pago Neto a Recibir:</span>
                <p className="text-base font-extrabold text-orange-600">${(liqMonto - (liqMonto * (liqRentPct / 100)) - (liqMonto * 0.15 * (liqIvaPct / 100))).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => alert("¡Liquidación y Retención Emitidas! Ambos comprobantes autorizados y cargados en el casillero tributario del SRI de pruebas.")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded transition-all cursor-pointer shadow-md"
              >
                Autorizar SRI
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Acceso al Sistema Real
  if (moduleName === "Acceso al Sistema Real" || moduleName === "Acceso upconta") {
    const handleCopyField = (text: string, type: "ruc" | "user" | "pass") => {
      navigator.clipboard.writeText(text);
      if (type === "ruc") {
        setCopiedRuc(true);
        setTimeout(() => setCopiedRuc(false), 2000);
      } else if (type === "user") {
        setCopiedUser(true);
        setTimeout(() => setCopiedUser(false), 2000);
      } else if (type === "pass") {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2000);
      }
    };

    const handleCopyAll = () => {
      const allText = `RUC: ${upContaRuc}\nUsuario: ${upContaUser}\nContraseña: ${upContaPass}`;
      navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    };

    return (
      <div className="w-full my-2 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-orange-500/30 space-y-6">
          {/* Main Title & Action Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/80 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Entorno Oficial <span className="text-orange-400 font-bold">Up</span>Conta</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Sistema Oficial & Certificado</span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Conoce la herramienta contable y ERP <span className="text-orange-400 font-black">Up</span>Conta
              </h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
                <strong><span className="text-orange-400 font-bold">Up</span>Conta</strong> te brinda acceso al sistema contable líder en Ecuador, garantizando soporte especializado, actualización constante ante el SRI y soluciones adaptadas a la medida de tu empresa.
              </p>
            </div>

            {/* Direct Link Button */}
            <a
              href="https://app.upconta.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2.5 shrink-0 border border-orange-400/40 cursor-pointer"
            >
              <Globe className="w-5 h-5" />
              <span>Ir al Navegador (app.upconta.com)</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Copy Credentials Card */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-orange-400" />
                <span>Credenciales de Ingreso Rápidas (Copiar en 1 Clic)</span>
              </h4>
              <button
                type="button"
                onClick={handleCopyAll}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  copiedAll
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600"
                }`}
              >
                {copiedAll ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>¡Todas Copiadas!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-orange-400" />
                    <span>Copiar Todo al Portapapeles</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* RUC */}
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">RUC Contribuyente</span>
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white tracking-wide truncate">{upContaRuc}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyField(upContaRuc, "ruc")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      copiedRuc
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
                    }`}
                  >
                    {copiedRuc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRuc ? "Copiado" : "Copiar"}</span>
                  </button>
                </div>
              </div>

              {/* Usuario */}
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Usuario / Correo</span>
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white tracking-wide truncate">{upContaUser}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyField(upContaUser, "user")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      copiedUser
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
                    }`}
                  >
                    {copiedUser ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUser ? "Copiado" : "Copiar"}</span>
                  </button>
                </div>
              </div>

              {/* Contraseña */}
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contraseña</span>
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white tracking-wide truncate">
                    {showPassword ? upContaPass : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Ver/Ocultar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyField(upContaPass, "pass")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                        copiedPass
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
                      }`}
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPass ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
