const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let historico = [];
let idCounter = 0; // Usado para criar um ID único para cada conta

// Rota para ler o histórico
app.get('/historico', (req, res) => {
    res.json(historico);
});

// Nova Rota para apagar um item específico do histórico
app.delete('/historico/:id', (req, res) => {
    const id = parseInt(req.params.id);
    historico = historico.filter(item => item.id !== id);
    res.json({ sucesso: true });
});

// Rota de Cálculo atualizada para versão Científica
app.post('/calcular', (req, res) => {
    const { num1, num2, operacao } = req.body;
    let resultado;
    let expressao = '';

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2); 

    if (isNaN(n1)) return res.status(400).json({ erro: 'Inválido' });

    // Operações normais (precisam de 2 números)
    if (['+', '-', '*', '/'].includes(operacao)) {
        if (isNaN(n2)) return res.status(400).json({ erro: 'Falta o 2º número' });
        
        switch (operacao) {
            case '+': resultado = n1 + n2; expressao = `${n1} + ${n2}`; break;
            case '-': resultado = n1 - n2; expressao = `${n1} - ${n2}`; break;
            case '*': resultado = n1 * n2; expressao = `${n1} * ${n2}`; break;
            case '/': 
                if (n2 === 0) return res.json({ erro: 'Divisão por zero' });
                resultado = n1 / n2; 
                expressao = `${n1} / ${n2}`; 
                break;
        }
    } 
    // Operações Científicas (precisam de apenas 1 número)
    else {
        switch (operacao) {
            case '√': 
                resultado = Math.sqrt(n1); 
                expressao = `√${n1}`; 
                break;
            case 'x²': 
                resultado = Math.pow(n1, 2); 
                expressao = `${n1}²`; 
                break;
            case '%': 
                resultado = n1 / 100; 
                expressao = `${n1}%`; 
                break;
            // Trigonometria: JavaScript usa Radianos, mas Engenheiros usam Graus. 
            // O código (n1 * Math.PI / 180) converte o valor para o resultado correto.
            case 'sin': 
                resultado = Math.sin(n1 * Math.PI / 180); 
                expressao = `sin(${n1}°)`; 
                break;
            case 'cos': 
                resultado = Math.cos(n1 * Math.PI / 180); 
                expressao = `cos(${n1}°)`; 
                break;
            case 'tan': 
                resultado = Math.tan(n1 * Math.PI / 180); 
                expressao = `tan(${n1}°)`; 
                break;
            default: return res.status(400).json({ erro: 'Operação inválida' });
        }
    }

    // Arredonda para evitar dízimas gigantescas do JavaScript (ex: 0.300000000004)
    resultado = parseFloat(resultado.toFixed(8));

    // Salva na memória com um ID único
    historico.unshift({ id: idCounter++, expressao: `${expressao} = ${resultado}` });
    
    if (historico.length > 15) historico.pop(); // Guarda até 15 itens agora

    res.json({ resultado });
});

app.listen(3001, () => {
    console.log(`Servidor Node a correr na porta 3001`);
});