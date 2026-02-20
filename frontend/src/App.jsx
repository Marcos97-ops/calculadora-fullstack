import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [display, setDisplay] = useState('');
  const [num1, setNum1] = useState(null);
  const [operacao, setOperacao] = useState(null);
  const [historico, setHistorico] = useState([]);

  const carregarHistorico = async () => {
    try {
      const res = await fetch('http://localhost:3001/historico');
      const data = await res.json();
      setHistorico(data);
    } catch (error) {
      console.log("Erro ao buscar histórico");
    }
  };

  useEffect(() => { carregarHistorico(); }, []);

  // Adiciona números ou o ponto decimal
  const addNumero = (numero) => {
    if (numero === '.' && display.includes('.')) return; // Evita dois pontos
    setDisplay(prev => prev + String(numero));
  };

  // Para operações normais (+, -, *, /)
  const escolherOperacao = (op) => {
    if (!display) return;
    setNum1(display);
    setOperacao(op);
    setDisplay('');
  };

  // Para operações científicas (calcula na hora, sem precisar de apertar = )
  const operacaoCientifica = async (op) => {
    if (!display) return;
    try {
      const response = await fetch('http://localhost:3001/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num1: display, operacao: op }) // Não envia o num2
      });
      const data = await response.json();
      setDisplay(data.erro ? data.erro : String(data.resultado));
      carregarHistorico();
    } catch (error) {
      setDisplay('Erro');
    }
  };

  // Faz o cálculo normal
  const calcular = async () => {
    if (!num1 || !operacao || !display) return;
    try {
      const response = await fetch('http://localhost:3001/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num1, num2: display, operacao })
      });
      const data = await response.json();
      setDisplay(data.erro ? data.erro : String(data.resultado));
      setNum1(null);
      setOperacao(null);
      carregarHistorico();
    } catch (error) {
      setDisplay('Erro');
    }
  };

  const limpar = () => {
    setDisplay(''); setNum1(null); setOperacao(null);
  };

  // Função para apagar um item do histórico
  const apagarHistorico = async (id) => {
    try {
      await fetch(`http://localhost:3001/historico/${id}`, { method: 'DELETE' });
      carregarHistorico(); // Atualiza a lista após apagar
    } catch (error) {
      console.log('Erro ao apagar');
    }
  };

  return (
    <div className="app-container">
      {/* Calculadora */}
      <div className="container">
        <h2>Calculadora Científica</h2>
        <div className="display">{display || '0'}</div>
        
        {/* Agora temos 5 colunas no teclado */}
        <div className="teclado cientifico">
          <button className="especial" onClick={() => operacaoCientifica('sin')}>sin</button>
          <button className="especial" onClick={() => operacaoCientifica('cos')}>cos</button>
          <button className="especial" onClick={() => operacaoCientifica('tan')}>tan</button>
          <button className="especial" onClick={() => operacaoCientifica('%')}>%</button>
          <button className="limpar" onClick={limpar}>C</button>

          <button className="especial" onClick={() => operacaoCientifica('√')}>√</button>
          <button onClick={() => addNumero('7')}>7</button>
          <button onClick={() => addNumero('8')}>8</button>
          <button onClick={() => addNumero('9')}>9</button>
          <button className="operador" onClick={() => escolherOperacao('/')}>/</button>

          <button className="especial" onClick={() => operacaoCientifica('x²')}>x²</button>
          <button onClick={() => addNumero('4')}>4</button>
          <button onClick={() => addNumero('5')}>5</button>
          <button onClick={() => addNumero('6')}>6</button>
          <button className="operador" onClick={() => escolherOperacao('*')}>*</button>

          <button onClick={() => addNumero('.')}>.</button>
          <button onClick={() => addNumero('1')}>1</button>
          <button onClick={() => addNumero('2')}>2</button>
          <button onClick={() => addNumero('3')}>3</button>
          <button className="operador" onClick={() => escolherOperacao('-')}>-</button>

          <button className="especial nulo" disabled> </button>
          <button onClick={() => addNumero('0')} style={{gridColumn: 'span 2'}}>0</button>
          <button className="igual" onClick={calcular}>=</button>
          <button className="operador" onClick={() => escolherOperacao('+')}>+</button>
        </div>
      </div>

      {/* Painel Lateral de Histórico com botão de apagar */}
      <div className="historico-container">
        <h3>Histórico</h3>
        <ul>
          {historico.length === 0 ? <p style={{color: '#888'}}>Nenhuma conta ainda.</p> : null}
          {historico.map((item) => (
            <li key={item.id}>
              <span>{item.expressao}</span>
              <button className="btn-apagar" onClick={() => apagarHistorico(item.id)}>✖</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;