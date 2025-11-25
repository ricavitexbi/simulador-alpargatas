'use client';
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MODELOS_DATA = {
  B2: {
    nome: 'Banbury 2',
    peso: 0.1453,
    features: [
      { id: 'by_tempo_mistura', nome: 'Tempo de Mistura', min: 0, max: 20, media: 11.4, step: 0.1, unidade: 'min' },
      { id: 'by_temp', nome: 'Temperatura', min: 70, max: 85, media: 76.5, step: 0.1, unidade: '°C' },
      { id: 'by_rpm', nome: 'Rotação', min: 5, max: 25, media: 17.8, step: 0.1, unidade: 'RPM' },
      { id: 'by_pressao_mistura', nome: 'Pressão de Mistura', min: 0, max: 5, media: 2.4, step: 0.1, unidade: 'bar' },
      { id: 'by_corrente', nome: 'Corrente Elétrica', min: 100, max: 320, media: 242, step: 1, unidade: 'A' },
      { id: 'by_cronomet_mistura', nome: 'Cronômetro Mistura', min: 20, max: 270, media: 165, step: 1, unidade: 's' },
    ],
    importances: {
      'by_corrente': 0.70,
      'by_rpm': 0.14,
      'by_cronomet_mistura': 0.07,
      'by_tempo_mistura': 0.04,
      'by_temp': 0.03,
      'by_pressao_mistura': 0.02
    }
  },
  B3: {
    nome: 'Banbury 3',
    peso: 0.0493,
    features: [
      { id: 'by_tempo_mistura', nome: 'Tempo de Mistura', min: 35, max: 50, media: 41, step: 0.1, unidade: 'min' },
      { id: 'by_temp', nome: 'Temperatura', min: 95, max: 110, media: 104, step: 0.1, unidade: '°C' },
      { id: 'by_rpm', nome: 'Rotação', min: 28, max: 32, media: 30, step: 0.1, unidade: 'RPM' },
      { id: 'by_pressao_mistura', nome: 'Pressão de Mistura', min: 3, max: 4, media: 3.3, step: 0.01, unidade: 'bar' },
      { id: 'by_corrente', nome: 'Corrente Elétrica', min: 420, max: 485, media: 455, step: 1, unidade: 'A' },
      { id: 'by_cronomet_mistura', nome: 'Cronômetro Mistura', min: 165, max: 185, media: 175, step: 1, unidade: 's' },
    ],
    importances: {
      'by_temp': 0.36,
      'by_rpm': 0.21,
      'by_cronomet_mistura': 0.20,
      'by_tempo_mistura': 0.17,
      'by_pressao_mistura': 0.03,
      'by_corrente': 0.02
    }
  },
  P: {
    nome: 'Prensa',
    peso: 0.8053,
    features: [
      { id: 'ps_temp_plato_01', nome: 'Temp. Plato 01', min: 140, max: 180, media: 160, step: 1, unidade: '°C' },
      { id: 'ps_temp_plato_02', nome: 'Temp. Plato 02', min: 140, max: 180, media: 160, step: 1, unidade: '°C' },
      { id: 'ps_temp_plato_03', nome: 'Temp. Plato 03', min: 140, max: 180, media: 160, step: 1, unidade: '°C' },
      { id: 'ps_temp_plato_04', nome: 'Temp. Plato 04', min: 140, max: 180, media: 160, step: 1, unidade: '°C' },
      { id: 'ps_temp_plato_05', nome: 'Temp. Plato 05', min: 140, max: 180, media: 160, step: 1, unidade: '°C' },
      { id: 'ps_temp_plato_06', nome: 'Temp. Plato 06', min: 140, max: 180, media: 160, step: 1, unidade: '°C' },
      { id: 'ps_pressao_vulc', nome: 'Pressão Vulcanização', min: 100, max: 200, media: 150, step: 1, unidade: 'bar' },
      { id: 'ps_periodo_vulc', nome: 'Período Vulcanização', min: 300, max: 600, media: 450, step: 10, unidade: 's' },
    ],
    importances: {
      'ps_temp_plato_04': 0.18,
      'ps_pressao_vulc': 0.17,
      'ps_temp_plato_01': 0.15,
      'ps_temp_plato_02': 0.12,
      'ps_temp_plato_03': 0.10,
      'ps_temp_plato_05': 0.10,
      'ps_temp_plato_06': 0.09,
      'ps_periodo_vulc': 0.09
    }
  }
};

const CORES = {
  B2: '#3498db',
  B3: '#e74c3c',
  P: '#27ae60'
};

const MAE_REFERENCIA = {
  teste: 1.997,
  validacao: 12.495
};

export default function SimuladorEnsemble() {
  const [modeloAtivo, setModeloAtivo] = useState('B2');
  const [valores, setValores] = useState(() => {
    const inicial = {};
    Object.keys(MODELOS_DATA).forEach(modelo => {
      inicial[modelo] = {};
      MODELOS_DATA[modelo].features.forEach(f => {
        inicial[modelo][f.id] = f.media;
      });
    });
    return inicial;
  });
  
  const [cenarios, setCenarios] = useState([]);

  const dadosImportancia = useMemo(() => {
    const modelo = MODELOS_DATA[modeloAtivo];
    return modelo.features
      .map(f => ({
        nome: f.nome,
        id: f.id,
        importancia: (modelo.importances[f.id] || 0) * 100,
        cor: CORES[modeloAtivo]
      }))
      .sort((a, b) => b.importancia - a.importancia);
  }, [modeloAtivo]);

  const calcularPredicao = (modeloKey, vals) => {
    const modelo = MODELOS_DATA[modeloKey];
    let score = 5;
    
    modelo.features.forEach(f => {
      const valor = vals[f.id];
      const desvio = (valor - f.media) / (f.max - f.min);
      const imp = modelo.importances[f.id] || 0;
      score += desvio * imp * 50;
    });
    
    return Math.max(0, Math.min(100, score));
  };

  const predicaoEnsemble = useMemo(() => {
    let total = 0;
    let pesoTotal = 0;
    
    Object.keys(MODELOS_DATA).forEach(modelo => {
      const pred = calcularPredicao(modelo, valores[modelo]);
      total += pred * MODELOS_DATA[modelo].peso;
      pesoTotal += MODELOS_DATA[modelo].peso;
    });
    
    return total / pesoTotal;
  }, [valores]);

  const predicaoAtual = useMemo(() => {
    return calcularPredicao(modeloAtivo, valores[modeloAtivo]);
  }, [modeloAtivo, valores]);

  const handleValorChange = (featureId, novoValor) => {
    setValores(prev => ({
      ...prev,
      [modeloAtivo]: {
        ...prev[modeloAtivo],
        [featureId]: parseFloat(novoValor)
      }
    }));
  };

  const resetarValores = () => {
    const modelo = MODELOS_DATA[modeloAtivo];
    const novosValores = {};
    modelo.features.forEach(f => {
      novosValores[f.id] = f.media;
    });
    setValores(prev => ({
      ...prev,
      [modeloAtivo]: novosValores
    }));
  };

  const salvarCenario = () => {
    const novoCenario = {
      id: Date.now(),
      nome: `Cenário ${cenarios.length + 1}`,
      modelo: modeloAtivo,
      valores: { ...valores[modeloAtivo] },
      predicao: predicaoAtual,
      predicaoEnsemble: predicaoEnsemble
    };
    setCenarios([...cenarios, novoCenario]);
  };

  const removerCenario = (id) => {
    setCenarios(cenarios.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Simulador de Predição de Inutilizados</h1>
          <p className="text-gray-400 text-sm md:text-base">Modelo Ensemble: Banbury 2 + Banbury 3 + Prensa</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-gray-800 rounded-xl p-3 md:p-4 border-l-4 border-purple-500">
            <p className="text-gray-400 text-xs md:text-sm">Predição Ensemble</p>
            <p className="text-xl md:text-3xl font-bold text-purple-400">{predicaoEnsemble.toFixed(2)}%</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 md:p-4 border-l-4" style={{ borderColor: CORES[modeloAtivo] }}>
            <p className="text-gray-400 text-xs md:text-sm">Predição {MODELOS_DATA[modeloAtivo].nome}</p>
            <p className="text-xl md:text-3xl font-bold" style={{ color: CORES[modeloAtivo] }}>{predicaoAtual.toFixed(2)}%</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 md:p-4 border-l-4 border-green-500">
            <p className="text-gray-400 text-xs md:text-sm">MAE Teste</p>
            <p className="text-xl md:text-3xl font-bold text-green-400">{MAE_REFERENCIA.teste.toFixed(3)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 md:p-4 border-l-4 border-yellow-500">
            <p className="text-gray-400 text-xs md:text-sm">MAE Validação</p>
            <p className="text-xl md:text-3xl font-bold text-yellow-400">{MAE_REFERENCIA.validacao.toFixed(3)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(MODELOS_DATA).map(modelo => (
            <button
              key={modelo}
              onClick={() => setModeloAtivo(modelo)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
                modeloAtivo === modelo 
                  ? 'text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={modeloAtivo === modelo ? { backgroundColor: CORES[modelo] } : {}}
            >
              {MODELOS_DATA[modelo].nome}
              <span className="ml-1 md:ml-2 text-xs opacity-75">({(MODELOS_DATA[modelo].peso * 100).toFixed(1)}%)</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-gray-800 rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Importância das Variáveis</h2>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosImportancia} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="nome" stroke="#9ca3af" width={95} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Importância']}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="importancia" radius={[0, 4, 4, 0]}>
                    {dadosImportancia.map((entry, index) => (
                      <Cell key={index} fill={entry.cor} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold">Simulação</h2>
              <div className="flex gap-2">
                <button 
                  onClick={resetarValores}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs md:text-sm transition-all"
                >
                  Resetar
                </button>
                <button 
                  onClick={salvarCenario}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs md:text-sm transition-all"
                >
                  Salvar
                </button>
              </div>
            </div>
            
            <div className="space-y-3 md:space-y-4 max-h-72 md:max-h-96 overflow-y-auto pr-2">
              {MODELOS_DATA[modeloAtivo].features.map(feature => (
                <div key={feature.id} className="bg-gray-700 rounded-lg p-2.5 md:p-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs md:text-sm font-medium">{feature.nome}</label>
                    <div className="flex items-center gap-1 md:gap-2">
                      <input
                        type="number"
                        value={valores[modeloAtivo][feature.id]}
                        onChange={(e) => handleValorChange(feature.id, e.target.value)}
                        step={feature.step}
                        min={feature.min}
                        max={feature.max}
                        className="w-20 md:w-24 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-right text-xs md:text-sm"
                      />
                      <span className="text-gray-400 text-xs w-6 md:w-8">{feature.unidade}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    value={valores[modeloAtivo][feature.id]}
                    onChange={(e) => handleValorChange(feature.id, e.target.value)}
                    min={feature.min}
                    max={feature.max}
                    step={feature.step}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{feature.min}</span>
                    <span className="text-purple-400">Média: {feature.media}</span>
                    <span>{feature.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {cenarios.length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Comparação de Cenários</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 md:py-3 px-2 md:px-4">Cenário</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4">Modelo</th>
                    <th className="text-right py-2 md:py-3 px-2 md:px-4">Pred. Modelo</th>
                    <th className="text-right py-2 md:py-3 px-2 md:px-4">Pred. Ensemble</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cenarios.map(cenario => (
                    <tr key={cenario.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-2 md:py-3 px-2 md:px-4 font-medium">{cenario.nome}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4">
                        <span 
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ backgroundColor: CORES[cenario.modelo], color: 'white' }}
                        >
                          {MODELOS_DATA[cenario.modelo].nome}
                        </span>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-right font-mono">{cenario.predicao.toFixed(2)}%</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-right font-mono text-purple-400">{cenario.predicaoEnsemble.toFixed(2)}%</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                        <button 
                          onClick={() => removerCenario(cenario.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-gray-500 text-xs md:text-sm">
          <p>Modelo: RandomForest Ensemble | MAE Validação: {MAE_REFERENCIA.validacao.toFixed(3)}</p>
          <p className="mt-1">⚠️ Simulação aproximada para visualização</p>
        </div>
      </div>
    </div>
  );
}
```

4. **Commit new file**

---

## 📋 **PASSO 3: Conectar Vercel ao GitHub**

1. Acesse: **https://vercel.com**
2. Clique em **Sign Up** (ou **Log In** se já tiver conta)
3. Escolha **Continue with GitHub**
4. Autorize o Vercel a acessar seu GitHub

---

## 📋 **PASSO 4: Fazer Deploy**

1. No dashboard do Vercel, clique em **Add New...** → **Project**
2. Na lista de repositórios, encontre **simulador-alpargatas**
3. Clique em **Import**
4. Na tela de configuração:
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `.` (deixe como está)
   - Não precisa mudar mais nada!
5. Clique em **Deploy**
6. **Aguarde 1-2 minutos** ⏳

---

## 📋 **PASSO 5: Pronto! 🎉**

Após o deploy, você verá:
- ✅ **URL do seu app:** algo como `simulador-alpargatas.vercel.app`
- Clique na URL para ver seu simulador funcionando!

---

## 📁 **Estrutura Final do Repositório:**
```
simulador-alpargatas/
├── app/
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── components/
│   └── SimuladorEnsemble.jsx
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
