class JogoBozo {
  constructor() {
    this.jogadores = [
      { nome: 'Jogador 1', placar: this.criarPlacarVazio(), cor: '#3498db' },
      { nome: 'Jogador 2', placar: this.criarPlacarVazio(), cor: '#e74c3c' },
    ];
    this.jogadorAtual = 0;
    this.jogadaAtual = 0;
    this.dados = [0, 0, 0, 0, 0];
    this.dadosSelecionados = [false, false, false, false, false];
    this.jogoFinalizado = false;

    this.categorias = {
      superior: [
        {
          id: 'uns',
          nome: 'Ás',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 1),
        },
        {
          id: 'dois',
          nome: 'Duque',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 2),
        },
        {
          id: 'tres',
          nome: 'Terno',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 3),
        },
        {
          id: 'quatros',
          nome: 'Quadra',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 4),
        },
        {
          id: 'cincos',
          nome: 'Quina',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 5),
        },
        {
          id: 'seis',
          nome: 'Sena',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 6),
        },
      ],
      inferior: [
        {
          id: 'trinca',
          nome: 'Trinca',
          pontos: null,
          calcular: (d) => this.calcularTrinca(d),
        },
        {
          id: 'quadra',
          nome: 'Quadrada',
          pontos: null,
          calcular: (d) => this.calcularQuadra(d),
        },
        {
          id: 'fullhouse',
          nome: 'Full House',
          pontos: null,
          calcular: (d) => this.calcularFullHouse(d),
        },
        {
          id: 'seqbaixa',
          nome: 'Seguida Baixa',
          pontos: null,
          calcular: (d) => this.calcularSequenciaBaixa(d),
        },
        {
          id: 'seqalta',
          nome: 'Seguida Alta',
          pontos: null,
          calcular: (d) => this.calcularSequenciaAlta(d),
        },
        {
          id: 'bozo',
          nome: 'General',
          pontos: null,
          calcular: (d) => this.calcularBozo(d),
        },
        {
          id: 'livre',
          nome: 'Jogada Livre',
          pontos: null,
          calcular: (d) => this.somarTodos(d),
        },
      ],
    };

    this.inicializarEventos();
    this.inicializarFooter();
    this.atualizarInterface();
    this.renderizarPlacar();
  }

  criarPlacarVazio() {
    return {
      superior: [null, null, null, null, null, null],
      inferior: [null, null, null, null, null, null, null],
      bonus: 0,
      total: 0,
    };
  }

  inicializarEventos() {
    document
      .getElementById('btnRolar')
      .addEventListener('click', () => this.rolarDados());
    document
      .getElementById('btnFinalizar')
      .addEventListener('click', () => this.finalizarJogada());
    document
      .getElementById('btnNovoJogo')
      .addEventListener('click', () => this.novoJogo());
    document
      .getElementById('btnReiniciar')
      .addEventListener('click', () => this.novoJogo());
  }

  inicializarFooter() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  rolarDados() {
    if (this.jogadaAtual >= 3) return;

    for (let i = 0; i < 5; i++) {
      if (!this.dadosSelecionados[i]) {
        this.dados[i] = Math.floor(Math.random() * 6) + 1;
      }
    }

    this.jogadaAtual++;
    this.atualizarInterface();
    this.verificarFimDaRodada();
  }

  toggleDado(index) {
    if (this.jogadaAtual === 0) return;
    this.dadosSelecionados[index] = !this.dadosSelecionados[index];
    this.atualizarInterface();
  }

  finalizarJogada() {
    if (this.jogadaAtual === 0) return;

    this.mostrarOpcoesPontuacao();
  }

  mostrarOpcoesPontuacao() {
    const categorias = [
      ...this.categorias.superior,
      ...this.categorias.inferior,
    ];

    categorias.forEach((categoria, index) => {
      const elemento = document.getElementById(categoria.id);
      if (elemento && !elemento.classList.contains('preenchida')) {
        elemento.classList.add('selecionada');
        elemento.onclick = () => this.escolherCategoria(categoria, index);

        const pontos = categoria.calcular(this.dados);
        elemento.querySelector('.pontos').textContent =
          pontos > 0 ? `+${pontos}` : '0';
      }
    });

    this.mostrarMensagem('Escolha uma categoria para pontuar!', 'sucesso');
  }

  escolherCategoria(categoria, index) {
    const pontos = categoria.calcular(this.dados);
    const isSuperior = index < 6;

    // Se for General na 1ª jogada, o jogo já foi finalizado
    if (
      this.jogoFinalizado &&
      categoria.id === 'bozo' &&
      this.jogadaAtual === 1
    ) {
      return;
    }

    if (isSuperior) {
      this.jogadores[this.jogadorAtual].placar.superior[index] = pontos;
    } else {
      this.jogadores[this.jogadorAtual].placar.inferior[index - 6] = pontos;
    }

    // Mostrar mensagem especial para combinações
    this.mostrarMensagemEspecial(categoria.id, pontos);

    this.calcularBonus();
    this.calcularTotal();

    // Só passa para a próxima rodada se o jogo não foi finalizado por General
    if (!this.jogoFinalizado) {
      this.proximaRodada();
    }
  }

  calcularBonus() {
    const superior = this.jogadores[this.jogadorAtual].placar.superior;
    const soma = superior.reduce((acc, val) => acc + (val || 0), 0);
    this.jogadores[this.jogadorAtual].placar.bonus = soma >= 63 ? 35 : 0;
  }

  calcularTotal() {
    const placar = this.jogadores[this.jogadorAtual].placar;
    const somaSuperior = placar.superior.reduce(
      (acc, val) => acc + (val || 0),
      0
    );
    const somaInferior = placar.inferior.reduce(
      (acc, val) => acc + (val || 0),
      0
    );
    placar.total = somaSuperior + somaInferior + placar.bonus;
  }

  proximaRodada() {
    // Alterna para o próximo jogador
    this.jogadorAtual = (this.jogadorAtual + 1) % this.jogadores.length;
    this.jogadaAtual = 0;
    this.dados = [0, 0, 0, 0, 0];
    this.dadosSelecionados = [false, false, false, false, false];

    this.renderizarPlacar();
    this.atualizarInterface();
    this.verificarFimDoJogo();
  }

  verificarFimDaRodada() {
    const btnFinalizar = document.getElementById('btnFinalizar');
    if (this.jogadaAtual >= 3) {
      btnFinalizar.disabled = false;
      this.mostrarMensagem('Última jogada! Escolha uma categoria.', 'erro');
    }
  }

  verificarFimDoJogo() {
    const todosJogadoresFinalizados = this.jogadores.every((jogador) => {
      const placar = jogador.placar;
      return (
        placar.superior.every((p) => p !== null) &&
        placar.inferior.every((p) => p !== null)
      );
    });

    if (todosJogadoresFinalizados) {
      this.finalizarJogo();
    }
  }

  finalizarJogo() {
    this.jogoFinalizado = true;
    const modal = document.getElementById('modalVitoria');
    const mensagem = document.getElementById('mensagemVitoria');

    // Encontra o vencedor
    const vencedor = this.jogadores.reduce((prev, current) =>
      prev.placar.total > current.placar.total ? prev : current
    );

    mensagem.textContent = `🎉 ${vencedor.nome} venceu com ${vencedor.placar.total} pontos!`;
    modal.style.display = 'block';

    // Desabilita todos os botões
    document.getElementById('btnRolar').disabled = true;
    document.getElementById('btnFinalizar').disabled = true;
  }

  // NOVA FUNÇÃO: Finalizar jogo com vitória imediata por General na 1ª jogada
  finalizarJogoComVitoriaImediata() {
    this.jogoFinalizado = true;
    const modal = document.getElementById('modalVitoria');
    const mensagem = document.getElementById('mensagemVitoria');

    const jogador = this.jogadores[this.jogadorAtual];
    mensagem.textContent = `🎉 ${jogador.nome} venceu imediatamente com um General na primeira jogada! 🏆`;
    modal.style.display = 'block';

    // Desabilita todos os botões
    document.getElementById('btnRolar').disabled = true;
    document.getElementById('btnFinalizar').disabled = true;
  }

  // NOVA FUNÇÃO: Mostrar mensagens especiais para combinações
  mostrarMensagemEspecial(categoriaId, pontos) {
    const mensagensEspeciais = {
      fullhouse: `Full House! ${pontos} pontos${
        this.jogadaAtual === 1 ? ' (1ª jogada!)' : ''
      }`,
      seqbaixa: `Sequência Baixa! ${pontos} pontos${
        this.jogadaAtual === 1 ? ' (1ª jogada!)' : ''
      }`,
      seqalta: `Sequência Alta! ${pontos} pontos${
        this.jogadaAtual === 1 ? ' (1ª jogada!)' : ''
      }`,
      quadra: `Quadrada! ${pontos} pontos${
        this.jogadaAtual === 1 ? ' (1ª jogada!)' : ''
      }`,
      bozo:
        this.jogadaAtual === 1
          ? '🎉 GENERAL NA PRIMEIRA JOGADA! VITÓRIA IMEDIATA! 🏆'
          : `General! ${pontos} pontos`,
    };

    if (mensagensEspeciais[categoriaId]) {
      const tipo =
        this.jogadaAtual === 1 && categoriaId === 'bozo' ? 'erro' : 'sucesso';
      this.mostrarMensagem(mensagensEspeciais[categoriaId], tipo);
    }
  }

  novoJogo() {
    this.jogadores = [
      { nome: 'Jogador 1', placar: this.criarPlacarVazio(), cor: '#3498db' },
      { nome: 'Jogador 2', placar: this.criarPlacarVazio(), cor: '#e74c3c' },
    ];
    this.jogadorAtual = 0;
    this.jogadaAtual = 0;
    this.dados = [0, 0, 0, 0, 0];
    this.dadosSelecionados = [false, false, false, false, false];
    this.jogoFinalizado = false;

    document.getElementById('modalVitoria').style.display = 'none';

    // Reabilita os botões
    document.getElementById('btnRolar').disabled = false;
    document.getElementById('btnFinalizar').disabled = true;

    this.renderizarPlacar();
    this.atualizarInterface();
    this.mostrarMensagem('Novo jogo iniciado! Vez do Jogador 1.', 'sucesso');
  }

  // FUNÇÕES DE CÁLCULO ATUALIZADAS COM NOVAS REGRAS
  somarNumeros(dados, numero) {
    return dados.filter((d) => d === numero).reduce((acc, val) => acc + val, 0);
  }

  somarTodos(dados) {
    return dados.reduce((acc, val) => acc + val, 0);
  }

  calcularTrinca(dados) {
    const contagem = this.contarValores(dados);
    return Object.values(contagem).some((c) => c >= 3)
      ? this.somarTodos(dados)
      : 0;
  }

  // ATUALIZADO: Quadrada - 35 pontos na 1ª jogada, 30 pontos nas demais
  calcularQuadra(dados) {
    const contagem = this.contarValores(dados);
    const temQuadra = Object.values(contagem).some((c) => c >= 4);

    if (!temQuadra) return 0;

    return this.jogadaAtual === 1 ? 35 : 30;
  }

  // ATUALIZADO: Full House - 15 pontos na 1ª jogada, 10 pontos nas demais
  calcularFullHouse(dados) {
    const contagem = Object.values(this.contarValores(dados));
    const temFullHouse = contagem.includes(3) && contagem.includes(2);

    if (!temFullHouse) return 0;

    return this.jogadaAtual === 1 ? 15 : 10;
  }

  // ATUALIZADO: Sequência Baixa - 25 pontos na 1ª jogada, 20 pontos nas demais
  calcularSequenciaBaixa(dados) {
    const unique = [...new Set(dados)].sort();
    const sequencias = ['1234', '2345', '3456'];
    const ehSequenciaBaixa = sequencias.some((seq) =>
      seq.split('').every((n) => unique.includes(parseInt(n)))
    );

    if (!ehSequenciaBaixa) return 0;

    return this.jogadaAtual === 1 ? 25 : 20;
  }

  // ATUALIZADO: Sequência Alta - 25 pontos na 1ª jogada, 20 pontos nas demais
  calcularSequenciaAlta(dados) {
    const unique = [...new Set(dados)].sort();
    const seq1 = [1, 2, 3, 4, 5];
    const seq2 = [2, 3, 4, 5, 6];
    const ehSequenciaAlta =
      seq1.every((n) => unique.includes(n)) ||
      seq2.every((n) => unique.includes(n));

    if (!ehSequenciaAlta) return 0;

    return this.jogadaAtual === 1 ? 25 : 20;
  }

  // ATUALIZADO: General - Vitória imediata na 1ª jogada, 40 pontos nas demais
  calcularBozo(dados) {
    const temGeneral = new Set(dados).size === 1;

    if (!temGeneral) return 0;

    if (this.jogadaAtual === 1) {
      this.finalizarJogoComVitoriaImediata();
      return 0; // Não pontua, apenas finaliza o jogo
    } else {
      return 40;
    }
  }

  contarValores(dados) {
    const contagem = {};
    dados.forEach((dado) => {
      contagem[dado] = (contagem[dado] || 0) + 1;
    });
    return contagem;
  }

  // NOVA FUNÇÃO: Criar dado visual com bolinhas
  criarDadoVisual(valor, index) {
    const dado = document.createElement('div');
    dado.className = `dado ${
      this.dadosSelecionados[index] ? 'selecionado' : ''
    }`;
    dado.setAttribute('data-value', valor);

    // Cria as bolinhas baseadas no valor do dado
    for (let i = 1; i <= 9; i++) {
      const pip = document.createElement('div');
      pip.className = 'pip';

      // Define quais posições terão bolinhas baseado no valor
      const posicoesComPip = {
        1: [5],
        2: [1, 9],
        3: [1, 5, 9],
        4: [1, 3, 7, 9],
        5: [1, 3, 5, 7, 9],
        6: [1, 3, 4, 6, 7, 9],
      };

      if (posicoesComPip[valor].includes(i)) {
        pip.classList.add('preenchido');
      } else {
        pip.classList.add('vazio');
      }

      dado.appendChild(pip);
    }

    dado.onclick = () => this.toggleDado(index);
    return dado;
  }

  // INTERFACE ATUALIZADA
  atualizarInterface() {
    this.renderizarDados();

    const jogador = this.jogadores[this.jogadorAtual];
    document.getElementById('jogadorAtual').textContent = `${jogador.nome}`;
    document.getElementById('jogadorAtual').style.color = jogador.cor;

    document.getElementById(
      'jogadaAtual'
    ).textContent = `Jogada: ${this.jogadaAtual}/3`;
    document.getElementById(
      'pontuacaoTotal'
    ).textContent = `Pontos: ${jogador.placar.total}`;

    const btnRolar = document.getElementById('btnRolar');
    const btnFinalizar = document.getElementById('btnFinalizar');

    btnRolar.disabled = this.jogadaAtual >= 3 || this.jogoFinalizado;
    btnFinalizar.disabled = this.jogadaAtual === 0 || this.jogoFinalizado;

    if (this.jogadaAtual === 0) {
      this.mostrarMensagem(
        `Vez de ${jogador.nome}! Clique em "Rolar Dados" para começar.`,
        'sucesso'
      );
    }
  }

  renderizarDados() {
    const container = document.getElementById('dados');
    container.innerHTML = '';

    this.dados.forEach((valor, index) => {
      if (valor > 0) {
        const dado = this.criarDadoVisual(valor, index);
        container.appendChild(dado);
      } else {
        // Dado não rolado ainda
        const dado = document.createElement('div');
        dado.className = 'dado';
        dado.textContent = '?';
        container.appendChild(dado);
      }
    });
  }

  renderizarPlacar() {
    this.renderizarCategoriasSuperior();
    this.renderizarCategoriasInferior();
    this.atualizarTotais();
  }

  renderizarCategoriasSuperior() {
    const container = document.getElementById('categoriasSuperior');
    container.innerHTML = '';

    this.categorias.superior.forEach((categoria, index) => {
      const pontos = this.jogadores[this.jogadorAtual].placar.superior[index];
      const elemento = this.criarElementoCategoria(categoria, pontos);
      container.appendChild(elemento);
    });
  }

  renderizarCategoriasInferior() {
    const container = document.getElementById('categoriasInferior');
    container.innerHTML = '';

    this.categorias.inferior.forEach((categoria, index) => {
      const pontos = this.jogadores[this.jogadorAtual].placar.inferior[index];
      const elemento = this.criarElementoCategoria(categoria, pontos);
      container.appendChild(elemento);
    });
  }

  criarElementoCategoria(categoria, pontos) {
    const div = document.createElement('div');
    div.className = `categoria ${pontos !== null ? 'preenchida' : ''}`;
    div.id = categoria.id;

    div.innerHTML = `
            <span>${categoria.nome}</span>
            <span class="pontos">${pontos !== null ? pontos : '-'}</span>
        `;

    return div;
  }

  atualizarTotais() {
    const placar = this.jogadores[this.jogadorAtual].placar;
    document.getElementById('bonus').textContent = placar.bonus;
    document.getElementById('totalPontos').textContent = placar.total;
  }

  mostrarMensagem(mensagem, tipo) {
    const elemento = document.getElementById('mensagem');
    elemento.textContent = mensagem;
    elemento.className = `mensagem ${tipo}`;
  }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  new JogoBozo();
});
