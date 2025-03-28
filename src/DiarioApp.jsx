
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

const eserciziGiornalieri = [
  {
    nome: "Panca Piana",
    link: "https://musclewiki.com/Barbell-Bench-Press"
  },
  {
    nome: "Rematore Bilanciere",
    link: "https://musclewiki.com/Barbell-Bent-Over-Row"
  },
  {
    nome: "Squat",
    link: "https://musclewiki.com/Barbell-Squat"
  }
];

export default function DiarioApp() {
  const [giorno, setGiorno] = useState(1);
  const [note, setNote] = useState("");
  const [peso, setPeso] = useState("");
  const [storicoPeso, setStoricoPeso] = useState({});
  const [carichi, setCarichi] = useState({});
  const frasi = [
    "Un giorno alla volta, un obiettivo alla volta",
    "Non smettere mai di crederci.",
    "Fallo per te stesso.",
    "La costanza vince sulla motivazione.",
    "Stai costruendo il tuo futuro oggi!"
  ];
  const fraseMotivazionale = frasi[(giorno - 1) % frasi.length];

  useEffect(() => {
    setNote(localStorage.getItem(`note-${giorno}`) || "");
    setPeso(localStorage.getItem(`peso-${giorno}`) || "");
    const storico = JSON.parse(localStorage.getItem("storico-peso") || "{}");
    setStoricoPeso(storico);

    const nuoviCarichi = {};
    eserciziGiornalieri.forEach(ex => {
      const saved = JSON.parse(localStorage.getItem(`carico-${ex.nome}-${giorno}`) || "{}");
      nuoviCarichi[ex.nome] = saved;
    });
    setCarichi(nuoviCarichi);
  }, [giorno]);

  const salva = () => {
    localStorage.setItem(`note-${giorno}`, note);
    localStorage.setItem(`peso-${giorno}`, peso);
    const nuovoStorico = { ...storicoPeso, [giorno]: parseFloat(peso) || 0 };
    localStorage.setItem("storico-peso", JSON.stringify(nuovoStorico));
    eserciziGiornalieri.forEach(ex => {
      localStorage.setItem(`carico-${ex.nome}-${giorno}`, JSON.stringify(carichi[ex.nome] || {}));
    });
    setStoricoPeso(nuovoStorico);
  };

  const reset = () => {
    localStorage.removeItem(`note-${giorno}`);
    localStorage.removeItem(`peso-${giorno}`);
    eserciziGiornalieri.forEach(ex => {
      localStorage.removeItem(`carico-${ex.nome}-${giorno}`);
    });
    setNote("");
    setPeso("");
    setCarichi({});
  };

  const aggiornaCarico = (nome, campo, valore) => {
    setCarichi(prev => ({
      ...prev,
      [nome]: {
        ...prev[nome],
        [campo]: valore
      }
    }));
  };

  const suggerisciCarico = (nome) => {
    const storico = [];
    for (let i = 1; i <= 70; i++) {
      const item = localStorage.getItem(`carico-${nome}-${i}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.kg) storico.push(parseFloat(parsed.kg));
      }
    }
    const max = Math.max(...storico, 0);
    return max ? (max + 2.5).toFixed(1) : "Inizia con un carico comodo";
  };

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
    <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', padding: '1rem', borderRadius: '10px' }}>
      <h1>Diario Giornaliero</h1>
      <p>Giorno {giorno} - Settimana {Math.ceil(giorno / 7)}</p>
      <p style={{ fontStyle: 'italic', color: 'gray' }}>{fraseMotivazionale}</p>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setGiorno(g => Math.max(1, g - 1))}>←</button>
        <button onClick={() => setGiorno(g => Math.min(70, g + 1))} style={{ marginLeft: '1rem' }}>→</button>
      </div>

      <h2>Peso del giorno</h2>
      <input
        type="number"
        value={peso}
        onChange={e => setPeso(e.target.value)}
        placeholder="Inserisci il peso (kg)"
        style={{ padding: '0.5rem', width: '100%' }}
      />

      <h2>Note</h2>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Scrivi le tue note"
        rows={4}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <h2>Tracciamento Esercizi</h2>
      {eserciziGiornalieri.map(ex => (
        <div key={ex.nome} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <strong>{ex.nome}</strong> - <a href={ex.link} target="_blank" rel="noreferrer">Guida</a><br />
          Kg: <input type="number" value={carichi[ex.nome]?.kg || ""} onChange={e => aggiornaCarico(ex.nome, "kg", e.target.value)} style={{ width: "70px", marginRight: "1rem" }} />
          Reps: <input type="number" value={carichi[ex.nome]?.reps || ""} onChange={e => aggiornaCarico(ex.nome, "reps", e.target.value)} style={{ width: "70px" }} />
          <div style={{ fontSize: '0.9rem', color: 'gray', marginTop: '0.5rem' }}>
            Suggerito: {suggerisciCarico(ex.nome)} kg
          </div>
        </div>
      ))}

      <button onClick={salva} style={{ marginTop: '1rem', marginRight: '1rem' }}>Salva Tutto</button>
      <button onClick={reset}>Reset Giorno</button>

      <h2 style={{ marginTop: '2rem' }}>Grafico Peso</h2>
      <Line data={datiPeso} />
    </div>
  );
}
