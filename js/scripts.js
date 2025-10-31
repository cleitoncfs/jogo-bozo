class JogoBozo {
  constructor() {
    this.jogadores = [{ nome: 'Jogador 1', placar: this.criarPlacarVazio() }];
    this.jogadorAtual = 0;
    this.jogadaAtual = 0;
    this.dados = [0, 0, 0, 0, 0];
    this.dadosSelecionados = [false, false, false, false, false];
    this.jogoFinalizado = false;

    this.categorias = {
      superior: [
        {
          id: 'uns',
          nome: 'Uns',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 1),
        },
        {
          id: 'dois',
          nome: 'Dois',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 2),
        },
        {
          id: 'tres',
          nome: 'Três',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 3),
        },
        {
          id: 'quatros',
          nome: 'Quatros',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 4),
        },
        {
          id: 'cincos',
          nome: 'Cincos',
          pontos: null,
          calcular: (d) => this.somarNumeros(d, 5),
        },
        {
          id: 'seis',
          nome: 'Seis',
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
          nome: 'Quadra',
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
          nome: 'Seq. Baixa',
          pontos: null,
          calcular: (d) => this.calcularSequenciaBaixa(d),
        },
        {
          id: 'seqalta',
          nome: 'Seq. Alta',
          pontos: null,
          calcular: (d) => this.calcularSequenciaAlta(d),
        },
        {
          id: 'bozo',
          nome: 'Bozó',
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

    if (isSuperior) {
      this.jogadores[this.jogadorAtual].placar.superior[index] = pontos;
    } else {
      this.jogadores[this.jogadorAtual].placar.inferior[index - 6] = pontos;
    }

    this.calcularBonus();
    this.calcularTotal();
    this.proximaRodada();
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
    const placar = this.jogadores[this.jogadorAtual].placar;
    const todosPreenchidos =
      placar.superior.every((p) => p !== null) &&
      placar.inferior.every((p) => p !== null);

    if (todosPreenchidos) {
      this.finalizarJogo();
    }
  }

  finalizarJogo() {
    this.jogoFinalizado = true;
    const modal = document.getElementById('modalVitoria');
    const mensagem = document.getElementById('mensagemVitoria');

    mensagem.textContent = `Parabéns! Você fez ${
      this.jogadores[this.jogadorAtual].placar.total
    } pontos!`;
    modal.style.display = 'block';
  }

  novoJogo() {
    this.jogadores[this.jogadorAtual] = {
      nome: 'Jogador 1',
      placar: this.criarPlacarVazio(),
    };
    this.jogadaAtual = 0;
    this.dados = [0, 0, 0, 0, 0];
    this.dadosSelecionados = [false, false, false, false, false];
    this.jogoFinalizado = false;

    document.getElementById('modalVitoria').style.display = 'none';
    this.renderizarPlacar();
    this.atualizarInterface();
  }

  // Funções de cálculo das combinações
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

  calcularQuadra(dados) {
    const contagem = this.contarValores(dados);
    return Object.values(contagem).some((c) => c >= 4)
      ? this.somarTodos(dados)
      : 0;
  }

  calcularFullHouse(dados) {
    const contagem = Object.values(this.contarValores(dados));
    return contagem.includes(3) && contagem.includes(2) ? 25 : 0;
  }

  calcularSequenciaBaixa(dados) {
    const unique = [...new Set(dados)].sort();
    const sequencias = ['1234', '2345', '3456'];
    return sequencias.some((seq) =>
      seq.split('').every((n) => unique.includes(parseInt(n)))
    )
      ? 30
      : 0;
  }

  calcularSequenciaAlta(dados) {
    const unique = [...new Set(dados)].sort();
    const seq1 = [1, 2, 3, 4, 5];
    const seq2 = [2, 3, 4, 5, 6];
    return seq1.every((n) => unique.includes(n)) ||
      seq2.every((n) => unique.includes(n))
      ? 40
      : 0;
  }

  calcularBozo(dados) {
    return new Set(dados).size === 1 ? 50 : 0;
  }

  contarValores(dados) {
    const contagem = {};
    dados.forEach((dado) => {
      contagem[dado] = (contagem[dado] || 0) + 1;
    });
    return contagem;
  }

  // Interface
  atualizarInterface() {
    this.renderizarDados();

    document.getElementById(
      'jogadaAtual'
    ).textContent = `Jogada: ${this.jogadaAtual}/3`;
    document.getElementById('pontuacaoTotal').textContent = `Pontos: ${
      this.jogadores[this.jogadorAtual].placar.total
    }`;

    const btnRolar = document.getElementById('btnRolar');
    const btnFinalizar = document.getElementById('btnFinalizar');

    btnRolar.disabled = this.jogadaAtual >= 3 || this.jogoFinalizado;
    btnFinalizar.disabled = this.jogadaAtual === 0 || this.jogoFinalizado;

    if (this.jogadaAtual === 0) {
      this.mostrarMensagem('Clique em "Rolar Dados" para começar!', 'sucesso');
    }
  }

  renderizarDados() {
    const container = document.getElementById('dados');
    container.innerHTML = '';

    this.dados.forEach((valor, index) => {
      const dado = document.createElement('div');
      dado.className = `dado ${
        this.dadosSelecionados[index] ? 'selecionado' : ''
      }`;
      dado.textContent = valor > 0 ? valor : '?';
      dado.onclick = () => this.toggleDado(index);
      container.appendChild(dado);
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
