// Dicionário de respostas
const responses = {
  "adeus": ["Volte sempre!", "Fico feliz em poder ajudar, volte sempre."],
  "tudo bem": ["Tudo ótimo, e você?", "Estou bem, obrigado por perguntar!"],
  "obrigado": ["De nada!", "Por nada! Estou aqui para ajudar."],
  "brunno": ["Brunno é um buxa professor! 👨‍🏫", "Adoro as aulas do Brunno!"]
};
const trackingResponses = {
  "rastreio": ["O produto está em rota de entrega.", "O produtos está passando por nossa central de distribuição.",
    "O produto está passando pelo procedimento de importação", "O produto está em trânsito para o país de destino"],
  "tempo": ["Em 3 dias", "Em 8 dias", "Amanhã", "Nunca"]
}

let contextoPróximo = null; // contexto futuro
let contexto = null; //salva contexto da conversa
let userName = null; // memória do nome do usuário
let dadosColetados = {}; // memória para dados coletados

// Respostas do chatbot
function getBotResponse(input) {
  input = input.toLowerCase();
  
  if (contexto != null) {
    return ResponseWithContext(input);
  }

  if (input.includes("1") || input.includes("garantia")) {
    if (userName === null) {
      contexto = "pedindo_nome";
      contextoPróximo = "garantia";
      return 'Antes de prosseguirmos, por favor, forneça seu nome.';
    }
    contexto = "garantia";
    return "Você selecionou 'Garantia'. Poderia me passar o nome e código do produto?";
  }

  if (input.includes("2") || input.includes("rastrear")) {
    if (userName === null) {
      contexto = "pedindo_nome";
      contextoPróximo = "rastreio";
      return 'Antes de prosseguirmos, por favor, forneça seu nome.';
    }
    contexto = "rastreio";
    return "Você selecionou 'Rastrear produto'. Poderia me passar o código de rastreio do produto?";
  }

  // Cumprimento com base no horário
  if (input.includes("oi") || input.includes("olá") || input.includes("ola")) {
    return greetingByTime();
  }

  // Guardar nome do usuário
  if (input.includes("meu nome é")) {
    userName = input.split("meu nome é")[1].trim();
    return `Prazer em conhecer você, ${userName}!`;
  }

  if (input.includes("quem sou eu") || input.includes("meu nome?")) {
    return userName ? `Você é ${userName}, claro! 😉` : "Ainda não sei seu nome.";
  }

  // Verificar no dicionário
  for (let key in responses) {
    if (input.includes(key)) {
      const possibleReplies = responses[key];
      return possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
    }
  }

  return "Ainda não sei responder isso... 🤔";
}

// Função para cumprimento com base no horário
function greetingByTime() {
  const hour = new Date().getHours();
  if (hour < 12) return "Olá, Bom dia! ☀️";
  if (hour < 18) return "Oi, Boa tarde! 🌤️";
  return "Oi, Boa noite! 🌙";
}

// Captura a mensagem do usuário
function sendMessage() {
  
  const inputField = document.getElementById("user-input");
  const userText = inputField.value.trim();

  if (userText === "") {
    return;
  }

  appendMessage(userText, "user-message");

  // Exibe "digitando..."
  setTimeout(() => {
    appendMessage("Digitando...", "bot-message temp");
  }, 300);

  // Gera resposta do bot
  setTimeout(() => {
    document.querySelector(".temp")?.remove();
    const botReply = getBotResponse(userText);
    appendMessage(botReply, "bot-message");
  }, 1500);

  inputField.value = "";
}

// Adiciona mensagens ao chat (limita 20 no máximo)
function appendMessage(text, className) {
  const chatBox = document.getElementById("chat-box");
  const message = document.createElement("div");
  message.className = className;
  message.innerText = text;
  chatBox.appendChild(message);

  // Limite de 20 mensagens
  if (chatBox.children.length > 20) {
    chatBox.removeChild(chatBox.firstChild);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

// Limpar chat
function clearChat() {
  const chatBox = document.getElementById("chat-box");
  const hasUserMessage = chatBox.querySelector(".user-message");
  if (!hasUserMessage) return; // não limpa se não houver mensagem do usuário
  chatBox.innerHTML = '<div class="bot-message">Olá, eu sou o Jonas, seu assistente virtual, como poderia ajudar? <br> Digite o número de acordo com o problema:<br> <br> 1 - Garantia do consumidor <br> 2 - Rastrear produto </div>';
  userName = null; // reseta memória
  contexto = null; // reseta contexto
  dadosColetados = {}; // reseta dados coletados
}

function ResponseWithContext(input) {
  
  if (contexto === "pedindo_nome")  {
    userName = input.charAt(0).toUpperCase() + input.slice(1);
    contexto = contextoPróximo;
    contextoPróximo = null;
    mensagemfinal = `Prazer em conhecer você, ${userName}!`;
    if (contexto === "garantia") {
      return mensagemfinal + "\nVocê selecionou 'Garantia'. Poderia me passar o nome e código do produto?";
    } else {
      return mensagemfinal + "\nVocê selecionou 'Rastrear produto'. Poderia me passar o código de rastreio do produto?";
    }
  }

  if (contexto === "garantia") {
    dadosColetados.produto = input;
    contexto = "garantia_data";
    return "Obrigado! Agora, por favor, informe a data da compra (DD/MM/AAAA).";
  }
  if (contexto === "garantia_data") {
    dadosColetados.dataCompra = input;
    contexto = "garantia_descrição"; 
    return `Perfeito! Agora, por favor, descreva o problema que você está enfrentando com o ${dadosColetados.produto}.`;
  }
  if (contexto === "garantia_descrição") {
    dadosColetados.descrição = input;
    contexto = "garantia_contato"; 
    return `Obrigado pela descrição. Antes de finalizarmos, forneça um e-mail ou telefone para contato.`;
  }
  if (contexto === "garantia_contato") {
    dadosColetados.contato = input;
    mensagemFinal = `Obrigado, ${userName ? userName : ''}! Coletamos as seguintes informações:\n-Produto: ${dadosColetados.produto}\n-Data da Compra: ${dadosColetados.dataCompra}\n-Descrição do Problema: ${dadosColetados.descrição}\n-Contato: ${dadosColetados.contato}\nNossa equipe entrará em contato em breve para ajudar com sua garantia.`;
    dadosColetados = {};
    contexto = null;
    return mensagemFinal;
  }
  if (contexto === "rastreio") {
    dadosColetados.rastreio = input;

    const possibleReplies2 = trackingResponses['rastreio'];
    estado = possibleReplies2[Math.floor(Math.random() * possibleReplies2.length)];
    const possibleReplies3 = trackingResponses['tempo'];
    tempo = possibleReplies3[Math.floor(Math.random() * possibleReplies3.length)];

    mensagemFinal = 'Código do produto: ' + dadosColetados.rastreio + '\nEstado do produto: ' + estado + '\n Tempo previsto para entrega: ' + tempo;
    contexto = null;
    dadosColetados = {};
    return mensagemFinal;
  }

  }

  function sendWithEnter(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }