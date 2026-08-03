/* ============================================
   ESTADO GLOBAL
   ============================================ */
let carrinho = JSON.parse(localStorage.getItem('alemaoCarrinho') || '[]');
let carouselIndex = 0;
let categoriaAtiva = 'todos'; // <--- ESSA LINHA É ESSENCIAL

/* ============================================
   INICIALIZAÇÃO
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
  // Menu toggle
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navMenu');
  if (toggle) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  // Inicializar dados
  renderCategorias();
  renderDiferenciais();
  renderProdutosDestaque();
  renderProdutosTodos(); // Renderiza a lista completa ao abrir
  renderFiltros();
  atualizarBadgeCarrinho();

  // Preencher textos SEO
  document.getElementById('heroTitulo').textContent = TEXTOS_SEO.heroTitulo;
  document.getElementById('heroDescricao').textContent = TEXTOS_SEO.heroDescricao;
  document.getElementById('sobreDescricao').textContent = TEXTOS_SEO.sobreNosDescricao;

  // Smooth scroll para links internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        if (nav) nav.classList.remove('open');
      }
    });
  });
});

/* ============================================
   NAVEGAÇÃO ENTRE PÁGINAS
   ============================================ */
function showPage(pageId) {
  // Esconder todas as páginas
  document.querySelectorAll('.page-produtos, .page-produto-detalhe, .page-carrinho, .page-endereco').forEach(p => {
    p.classList.remove('active');
  });

  // Esconder/mostrar conteúdo principal
  const mainContent = document.getElementById('mainContent');

  if (pageId === 'home') {
    if (mainContent) mainContent.style.display = 'block';
  } else {
    if (mainContent) mainContent.style.display = 'none';
    document.getElementById(pageId).classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================
   RENDERIZAR CATEGORIAS
   ============================================ */
function renderCategorias() {
  const container = document.getElementById('categoriasGrid');
  if (!container) return;

  container.innerHTML = CATEGORIAS.map(cat => `
    <div class="categoria-card" onclick="filtrarCategoria('${cat.id}')">
      <span class="icon">${cat.icone}</span>
      ${cat.nome}
    </div>
  `).join('');
}

/* ============================================
   RENDERIZAR DIFERENCIAIS
   ============================================ */
function renderDiferenciais() {
  const container = document.getElementById('diferenciaisGrid');
  if (!container) return;

  const icones = ['🛍️', '🚚', '💬', '⭐', '💰', '✅'];
  container.innerHTML = TEXTOS_SEO.diferenciais.map((diff, idx) => `
    <div class="diferencial-item">
      <span class="icon">${icones[idx]}</span>
      <h4>${diff.titulo}</h4>
      <p>${diff.descricao}</p>
    </div>
  `).join('');
}

/* ============================================
   RENDERIZAR PRODUTOS DESTAQUE
   ============================================ */
function renderProdutosDestaque() {
  const container = document.getElementById('produtosCarousel');
  if (!container) return;

  const destaques = PRODUTOS.slice(0, 8); // Pega os 8 primeiros
  container.innerHTML = destaques.map(prod => `
    <div class="produto-card" onclick="abrirProduto('${prod.id}')">
      <img src="${prod.imagem}" alt="${prod.nome}" loading="lazy">
      <h4>${prod.nome}</h4>
      <div class="categoria-marca">${prod.marca}</div>
      <button class="btn btn-primary" style="font-size:0.75rem;" onclick="event.stopPropagation(); abrirProduto('${prod.id}')">SOLICITAR ORÇAMENTO</button>
    </div>
  `).join('');
}

/* ============================================
   LÓGICA DE FILTRO E PESQUISA
   ============================================ */

function filtrarTudo() {
  renderProdutosTodos();
}

function renderProdutosTodos() {
  const container = document.getElementById('produtosTodosGrid');
  if (!container) return;

  const input = document.getElementById('searchInput');
  const termoPesquisa = input ? input.value.toLowerCase() : "";

  // Filtra por Categoria E por Termo de Pesquisa
  const filtrados = PRODUTOS.filter(prod => {
    const matchesCategoria = (categoriaAtiva === 'todos' || prod.categoria === categoriaAtiva);
    const matchesSearch = prod.nome.toLowerCase().includes(termoPesquisa) || 
                          prod.id.toString().includes(termoPesquisa);
    
    return matchesCategoria && matchesSearch;
  });

  if (filtrados.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #8a9bab;">Nenhum produto encontrado...</p>`;
    return;
  }

  container.innerHTML = filtrados.map(prod => `
    <div class="produto-todos-card" onclick="abrirProduto('${prod.id}')">
      <img src="${prod.imagem}" alt="${prod.nome}" loading="lazy">
      <h4>${prod.nome}</h4>
      <div class="codigo">Código: ${prod.id}</div>
    </div>
  `).join('');
}

function filtrarCategoria(catId, btnEl) {
  categoriaAtiva = catId;

  // Atualizar botões visuais de filtro
  document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
  
  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    // Se clicou na Home, tenta achar o botão correspondente na página de produtos
    const botoes = document.querySelectorAll('.filtro-btn');
    botoes.forEach(btn => {
        // Se o texto do botão ou o atributo de clique coincidir com o ID
        if(btn.getAttribute('onclick')?.includes(catId)) {
            btn.classList.add('active');
        }
    });
  }

  renderProdutosTodos();
  
  // Se estiver na Home (mainContent visível), muda para a página de produtos
  const mainContent = document.getElementById('mainContent');
  if (mainContent && mainContent.style.display !== 'none') {
    showPage('pageProdutos');
  }
}

/* ============================================
   CAROUSEL
   ============================================ */
function carouselNext() {
  const container = document.getElementById('produtosCarousel');
  if (container) {
    container.scrollLeft += 200;
  }
}

function carouselPrev() {
  const container = document.getElementById('produtosCarousel');
  if (container) {
    container.scrollLeft -= 200;
  }
}

/* ============================================
   RENDERIZAR FILTROS (BOTÕES)
   ============================================ */
function renderFiltros() {
  const container = document.getElementById('filtrosContainer');
  if (!container) return;

  let html = `<button class="filtro-btn active" onclick="filtrarCategoria('todos', this)">Todos</button>`;
  html += CATEGORIAS.map(cat => `
    <button class="filtro-btn" onclick="filtrarCategoria('${cat.id}', this)">${cat.nome}</button>
  `).join('');
  container.innerHTML = html;
}

/* ============================================
   ABRIR DETALHE DO PRODUTO
   ============================================ */
function abrirProduto(prodId) {
  const produto = PRODUTOS.find(p => p.id === prodId);
  if (!produto) return;

  const container = document.getElementById('produtoDetalheContent');
  if (!container) return;

  container.innerHTML = `
    <img class="produto-detalhe-img" src="${produto.imagem}" alt="${produto.nome}">
    <h2 class="produto-detalhe-nome">${produto.nome}</h2>
    <div class="produto-detalhe-marca">${produto.marca}</div>
    <div class="produto-detalhe-codigo">Código: ${produto.id}</div>
    <p class="produto-detalhe-desc">${produto.descricao}</p>
    <div class="quantidade-wrapper">
      <label>Quantidade:</label>
      <input type="number" id="qtdProduto" value="1" min="1" max="999">
    </div>
    <div class="produto-detalhe-botoes">
      <button class="btn btn-primary" onclick="adicionarCarrinho('${produto.id}')">🛒 Adicionar ao Carrinho</button>
      <button class="btn btn-secondary" onclick="concluirPedido('${produto.id}')">✓ Concluir</button>
    </div>
  `;

  showPage('pageProdutoDetalhe');
}

/* ============================================
   CARRINHO DE COMPRAS
   ============================================ */
function adicionarCarrinho(prodId) {
  const produto = PRODUTOS.find(p => p.id === prodId);
  if (!produto) return;

  const qtdInput = document.getElementById('qtdProduto');
  const qtd = qtdInput ? parseInt(qtdInput.value) : 1;

  const existente = carrinho.find(item => item.id === prodId);
  if (existente) {
    existente.quantidade += qtd;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      marca: produto.marca,
      imagem: produto.imagem,
      quantidade: qtd
    });
  }

  salvarCarrinho();
  atualizarBadgeCarrinho();
  showPage('pageProdutos');
}

function salvarCarrinho() {
  localStorage.setItem('alemaoCarrinho', JSON.stringify(carrinho));
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarBadgeCarrinho();
  renderCarrinho();
}

function renderCarrinho() {
  const container = document.getElementById('carrinhoItems');
  if (!container) return;

  const botoesContainer = document.getElementById('carrinhoBotoes');

  if (carrinho.length === 0) {
    container.innerHTML = `
      <div class="carrinho-vazio">
        <p style="font-size:2rem;margin-bottom:10px;">🛒</p>
        <p>Seu carrinho está vazio.</p>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="showPage('pageProdutos')">Ver Produtos</button>
      </div>
    `;
    if (botoesContainer) botoesContainer.style.display = 'none';
    return;
  }

  container.innerHTML = carrinho.map((item, index) => `
    <div class="carrinho-item">
      <img src="${item.imagem}" alt="${item.nome}">
      <div class="carrinho-item-info">
        <h4>${item.nome}</h4>
        <span>${item.marca} • ${item.id}</span>
      </div>
      <div class="carrinho-item-qtd">x${item.quantidade}</div>
      <button class="carrinho-item-remove" onclick="removerDoCarrinho(${index})">🗑️</button>
    </div>
  `).join('');

  if (botoesContainer) botoesContainer.style.display = 'flex';
}

function abrirCarrinho() {
  renderCarrinho();
  showPage('pageCarrinho');
}

/* ============================================
   CONCLUIR PEDIDO E WHATSAPP
   ============================================ */
function concluirPedido(prodId) {
  // Se a função for chamada a partir do botão "Concluir" no detalhe do produto
  if(prodId) {
      const produto = PRODUTOS.find(p => p.id === prodId);
      if (produto) {
        const qtdInput = document.getElementById('qtdProduto');
        const qtd = qtdInput ? parseInt(qtdInput.value) : 1;
        const existente = carrinho.find(item => item.id === prodId);
        if (existente) {
          existente.quantidade += qtd;
        } else {
          carrinho.push({
            id: produto.id, nome: produto.nome, marca: produto.marca,
            imagem: produto.imagem, quantidade: qtd
          });
        }
        salvarCarrinho();
        atualizarBadgeCarrinho();
      }
  }
  abrirEndereco();
}

function abrirEndereco() {
  if (carrinho.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
  }
  renderResumoCarrinho();
  showPage('pageEndereco');
}

function renderResumoCarrinho() {
  const container = document.getElementById('resumoCarrinho');
  if (!container) return;

  container.innerHTML = carrinho.map(item => `
    <p>✅ <strong>${item.quantidade}x</strong> ${item.nome} <small>(${item.id})</small></p>
  `).join('');
}

function enviarWhatsApp() {
  const endereco = document.getElementById('enderecoInput')?.value || '';
  const bairro = document.getElementById('bairroInput')?.value || '';
  const cidade = document.getElementById('cidadeInput')?.value || 'Londrina - PR';

  if (!endereco.trim()) {
    alert('Por favor, informe o endereço para entrega.');
    return;
  }

  // Formatação Profissional para WhatsApp
  let mensagem = `*📦 NOVO PEDIDO - ALEMÃO DOCES*%0A`;
  mensagem += `------------------------------------------%0A%0A`;
  mensagem += `*Olá! Gostaria de um orçamento para:*%0A%0A`;

  carrinho.forEach(item => {
    mensagem += `✅ *${item.quantidade}x* ${item.nome}%0A`;
    mensagem += `      _Cód: ${item.id}_%0A%0A`;
  });

  mensagem += `------------------------------------------%0A`;
  mensagem += `*📍 DADOS PARA ENTREGA:*%0A`;
  mensagem += `*Endereço:* ${endereco}%0A`;
  if (bairro) mensagem += `*Bairro:* ${bairro}%0A`;
  mensagem += `*Cidade:* ${cidade}%0A%0A`;
  mensagem += `------------------------------------------%0A`;
  mensagem += `_Pedido enviado via Catálogo Online_`;

  const telefone = '5543996107209';
  const url = `https://wa.me/${telefone}?text=${mensagem}`;

  // Limpa o carrinho após enviar
  carrinho = [];
  salvarCarrinho();
  atualizarBadgeCarrinho();

  window.open(url, '_blank');
}