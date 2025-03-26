
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function DiarioApp() {
  const [giorno, setGiorno] = useState(1);
  const [note, setNote] = useState("");
  const [peso, setPeso] = useState("");
  const [storicoPeso, setStoricoPeso] = useState({});
  const frasi = [
    "Un giorno alla volta, un obiettivo alla volta 💪",
    "Non smettere mai di crederci.",
    "Fallo per te stesso.",
    "La costanza vince sulla motivazione.",
    "Stai costruendo il tuo futuro oggi!"
  ];
  const fraseMotivazionale = frasi[(giorno - 1) % frasi.length];

  useEffect(() => {
    const salvata = localStorage.getItem(`note-giorno-${giorno}`);
    const pesoSalvato = localStorage.getItem(`peso-giorno-${giorno}`);
    setNote(salvata || "");
    setPeso(pesoSalvato || "");
    const storico = JSON.parse(localStorage.getItem("storico-peso") || "{}");
    setStoricoPeso(storico);
  }, [giorno]);

  const salvaNote = () => {
    localStorage.setItem(`note-giorno-${giorno}`, note);
    localStorage.setItem(`peso-giorno-${giorno}`, peso);
    const storico = { ...storicoPeso, [giorno]: parseFloat(peso) || 0 };
    localStorage.setItem("storico-peso", JSON.stringify(storico));
    setStoricoPeso(storico);
  };

  const resetNote = () => {
    localStorage.removeItem(`note-giorno-${giorno}`);
    localStorage.removeItem(`peso-giorno-${giorno}`);
    setNote("");
    setPeso("");
  };

  const giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
  const giornoSettimana = giorniSettimana[(giorno - 1) % 7];
  const settimana = Math.ceil(giorno / 7);
  const fase = settimana <= 6 ? "Ricomposizione" : "Definizione";

  const allenamenti = {
    0: "Palestra A - Spinta",
    1: "Bici - Endurance medio",
    2: "Palestra B - Tirata",
    3: "Stretching / Recupero",
    4: "Palestra C - Gambe",
    5: "Bici - Lungo",
    6: "Riposo / Camminata"
  };

  const esercizi = {
    "Palestra A - Spinta": [
      "Panca piana 4x6-8",
      "Distensioni manubri 3x8-10",
      "Military press 3x8-10",
      "Alzate laterali 3x12-15",
      "Pushdown tricipiti 3x10-12",
      "Crunch 3x20"
    ],
    "Palestra B - Tirata": [
      "Trazioni 4x6-10",
      "Rematore bilanciere 3x8-10",
      "Rematore manubrio 3x10-12",
      "Curl bilanciere 3x10-12",
      "Curl manubri 3x12",
      "Plank 3x60 sec"
    ],
    "Palestra C - Gambe": [
      "Squat 4x6-8",
      "Affondi 3x10+10",
      "Stacco rumeno 3x8-10",
      "Leg curl 3x10-12",
      "Calf raises 3x20",
      "Crunch inverso 3x20"
    ]
  };

  const alimentazione = {
    colazione: "60g avena + 200ml latte di riso + 30g whey + 1 banana",
    spuntino: "125g yogurt di soia + 1 frutto",
    pranzo: "100g riso + 150g pollo + verdure + 10g olio EVO",
    merenda: "60g pane integrale + 30g bresaola",
    cena: "150g salmone + 200g patate dolci + verdure"
  };

  const oggiAllenamento = allenamenti[(giorno - 1) % 7];
  const oggiEsercizi = esercizi[oggiAllenamento] || [];

  const datiPeso = {
    labels: Object.keys(storicoPeso).map(k => `G${k}`),
    datasets: [
      {
        label: "Peso",
        data: Object.values(storicoPeso),
        fill: false,
        borderColor: "blue",
        tension: 0.1
      }
    ]
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '1rem', borderRadius: '10px' }}>
      <h1>Diario Giornaliero</h1>
      <p>Giorno {giorno} - {giornoSettimana}</p>
      <p>Settimana {settimana} - Fase: {fase}</p>
      <p style={{ fontStyle: 'italic', color: 'gray' }}>{fraseMotivazionale}</p>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setGiorno(g => Math.max(1, g - 1))}>Indietro</button>
        <button onClick={() => setGiorno(g => Math.min(70, g + 1))} style={{ marginLeft: '1rem' }}>Avanti</button>
      </div>

      <h2>Allenamento: {oggiAllenamento}</h2>
      <ul>{oggiEsercizi.map((ex, idx) => <li key={idx}>{ex}</li>)}</ul>

      <h2>Piano Alimentare</h2>
      <ul>
        <li>Colazione: {alimentazione.colazione}</li>
        <li>Spuntino: {alimentazione.spuntino}</li>
        <li>Pranzo: {alimentazione.pranzo}</li>
        <li>Merenda: {alimentazione.merenda}</li>
        <li>Cena: {alimentazione.cena}</li>
      </ul>

      <h2>Peso del giorno</h2>
      <input
        type="number"
        value={peso}
        onChange={e => setPeso(e.target.value)}
        placeholder="Inserisci il peso in kg"
        style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%' }}
      />

      <h2>Note del giorno</h2>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Scrivi le tue note, sensazioni, peso..."
        rows={4}
        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
      />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button onClick={salvaNote}>Salva</button>
        <button onClick={resetNote}>Reset</button>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Grafico Peso</h2>
      <Line data={datiPeso} />
    </div>
  );
}
