/**
 * Clone da Pizzaria Paulistana Delivery
 * Reconstruído com base nos dados e comportamentos extraídos por Engenharia Reversa
 */

// Estado da Aplicação
const appState = {
  cart: [],
  selectedFilial: null,
  selectedBairro: null,
  deliveryFee: 0.00,
  deliveryType: 'delivery', // 'delivery' ou 'retirada'
  activeCategory: 'todas',
  searchQuery: '',
  activeTab: 'modern', // 'modern' ou 'expresso'
  customizingPizza: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initData();
  renderProducts();
  renderFeatures();
  renderReviews();
  renderFiliaisCards();
  initBairrosSelector();
  updateCartUI();
  setupEventListeners();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Carregamento inicial de dados
function initData() {
  const data = window.PIZZARIA_DATA;
  if (!data) {
    console.error('Dados da pizzaria não encontrados!');
    return;
  }

  // Filial inicial padrão (Asa Sul ou a primeira)
  appState.selectedFilial = data.filiais[0] || null;

  // Bairro inicial padrão (Asa Sul)
  const defaultBairro = data.bairros.find(b => b.bairro_nome.toLowerCase().includes('asa sul')) || data.bairros[0];
  if (defaultBairro) {
    appState.selectedBairro = defaultBairro;
    appState.deliveryFee = parseFloat(defaultBairro.taxaentrega) || 0;
  }

  updateHeaderStoreInfo();
}

// Atualiza informações no cabeçalho
function updateHeaderStoreInfo() {
  const currentFilialEl = document.getElementById('current-filial-name');
  const currentBairroEl = document.getElementById('current-bairro-name');
  const currentFeeEl = document.getElementById('current-delivery-fee');

  if (currentFilialEl && appState.selectedFilial) {
    currentFilialEl.textContent = appState.selectedFilial.descricaofilial;
  }
  if (currentBairroEl && appState.selectedBairro) {
    currentBairroEl.textContent = appState.selectedBairro.bairro_nome;
  }
  if (currentFeeEl) {
    currentFeeEl.textContent = appState.deliveryFee === 0 ? 'Grátis' : `R$ ${appState.deliveryFee.toFixed(2).replace('.', ',')}`;
  }
}

// Renderiza a lista de produtos / pizzas
function renderProducts() {
  const container = document.getElementById('products-container');
  if (!container) return;

  const data = window.PIZZARIA_DATA;
  if (!data || !data.products) return;

  let filtered = data.products.filter(p => p.category !== 'bordas'); // bordas são opcionais de pizza

  // Filtro por categoria
  if (appState.activeCategory !== 'todas') {
    filtered = filtered.filter(p => p.category === appState.activeCategory);
  }

  // Filtro por busca
  if (appState.searchQuery.trim() !== '') {
    const q = appState.searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.ingredients.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-16 text-gray-400">
        <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 text-gold opacity-60"></i>
        <h3 class="text-xl font-bold text-white mb-1">Nenhum item encontrado</h3>
        <p class="text-sm">Tente buscar por outro sabor ou ingrediente.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Mapeia imagens adequadas para cada categoria
  const getProductImage = (cat) => {
    switch (cat) {
      case 'populares': return 'assets/pizza-promocional.jpg';
      case 'tradicionais': return 'assets/pizza-tradicional.jpg';
      case 'especiais': return 'assets/pizza-especial.jpg';
      case 'doces': return 'assets/pizza-doce.jpg';
      default: return 'assets/pizza-tradicional.jpg';
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'populares': return '<span class="bg-red-950/80 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">🔥 Mais Pedida</span>';
      case 'tradicionais': return '<span class="bg-amber-950/80 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">🍕 Tradicional</span>';
      case 'especiais': return '<span class="bg-yellow-950/80 text-yellow-400 border border-yellow-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">⭐ Nobre / Especial</span>';
      case 'doces': return '<span class="bg-pink-950/80 text-pink-300 border border-pink-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">🍫 Doce Artesanal</span>';
      case 'bebidas': return '<span class="bg-blue-950/80 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">🥤 Bebida Gelada</span>';
      case 'molhos': return '<span class="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">🌿 Molho da Casa</span>';
      default: return '';
    }
  };

  container.innerHTML = filtered.map(item => {
    const isPizza = ['populares', 'tradicionais', 'especiais', 'doces'].includes(item.category);
    const imgUrl = getProductImage(item.category);

    return `
      <div class="product-card group flex flex-col justify-between">
        ${isPizza ? `
          <div class="relative h-44 w-full overflow-hidden bg-zinc-900">
            <img src="${imgUrl}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#17181c] via-transparent to-black/30"></div>
            <div class="absolute top-3 left-3">
              ${getCategoryBadge(item.category)}
            </div>
          </div>
        ` : `
          <div class="p-4 bg-zinc-900/60 border-b border-white/5 flex items-center justify-between">
            ${getCategoryBadge(item.category)}
            <i data-lucide="${item.category === 'bebidas' ? 'glass-water' : 'sparkles'}" class="w-5 h-5 text-gold/70"></i>
          </div>
        `}

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-display text-lg font-bold text-white mb-1.5 group-hover:text-gold transition-colors">${item.name}</h3>
            ${item.ingredients ? `<p class="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">${item.ingredients}</p>` : ''}
          </div>

          <div class="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
            <div>
              <span class="text-[11px] uppercase tracking-wider text-gray-500 block">A partir de</span>
              <span class="text-lg font-bold text-gradient-gold">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            </div>

            <button 
              onclick="${isPizza ? `openPizzaModal('${item.id}')` : `addSimpleItemToCart('${item.id}')`}" 
              class="px-4 py-2 bg-gradient-to-r from-[#d49f3e] to-[#b07e26] hover:from-[#fce09b] hover:to-[#d49f3e] text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <i data-lucide="${isPizza ? 'sliders-horizontal' : 'plus'}" class="w-3.5 h-3.5"></i>
              ${isPizza ? 'Montar Pizza' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// Renderiza Destaques
function renderFeatures() {
  const container = document.getElementById('features-container');
  if (!container) return;

  const features = window.PIZZARIA_DATA?.features || [
    { title: "Massa Artesanal", desc: "Preparada diariamente com fermentação natural de 24h." },
    { title: "Ingredientes Selecionados", desc: "Queijos nobres, molho caseiro e recheios generosos." },
    { title: "Entrega Rápida", desc: "Sua pizza quentinha com motoboys próprios da casa." },
    { title: "Atendimento com Carinho", desc: "Mais de 6 anos de tradição e paixão pela gastronomia." }
  ];

  const icons = ['flame', 'award', 'bike', 'heart-handshake'];

  container.innerHTML = features.map((f, i) => `
    <div class="glass-panel p-6 rounded-2xl flex flex-col items-center text-center group hover:border-gold transition-all">
      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/10 border border-amber-500/30 flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform">
        <i data-lucide="${icons[i] || 'sparkles'}" class="w-6 h-6"></i>
      </div>
      <h4 class="font-display text-base font-bold text-white mb-2">${f.title}</h4>
      <p class="text-xs text-gray-400 leading-relaxed">${f.desc}</p>
    </div>
  `).join('');
}

// Renderiza Depoimentos
function renderReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  const reviews = window.PIZZARIA_DATA?.reviews || [
    { name: "Pedro Henrique", text: "Sabor autêntico de pizzaria artesanal. As bordas recheadas são um espetáculo à parte. Voltarei sempre!", rating: 5 },
    { name: "Mariana Costa", text: "A pizza Candanga com carne seca é a melhor de Brasília! Chegou super rápida e fumegando.", rating: 5 },
    { name: "Lucas Almeida", text: "Massa leve e crocante, recheio de verdade e entrega no prazo certinho no Sudoeste. Nota 10!", rating: 5 },
    { name: "Beatriz Ribeiro", text: "Atendimento excelente no WhatsApp e a pizza de Chocolate fechou nossa noite perfeitamente.", rating: 5 }
  ];

  container.innerHTML = reviews.map(r => `
    <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-1 text-gold mb-3">
          ${Array(Math.floor(r.rating)).fill('<i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>').join('')}
        </div>
        <p class="text-sm text-gray-300 italic mb-4">"${r.text}"</p>
      </div>
      <div class="flex items-center gap-3 pt-3 border-t border-white/5">
        <div class="w-8 h-8 rounded-full bg-red-900/40 text-gold flex items-center justify-center font-bold text-xs border border-gold/30">
          ${r.name.charAt(0)}
        </div>
        <span class="text-xs font-semibold text-white">${r.name}</span>
      </div>
    </div>
  `).join('');
}

// Inicializa o seletor de bairros & filiais
function initBairrosSelector() {
  const selectBairroEl = document.getElementById('modal-select-bairro');
  if (!selectBairroEl) return;

  const data = window.PIZZARIA_DATA;
  if (!data || !data.bairros) return;

  // Ordena bairros alfabeticamente
  const sorted = [...data.bairros].sort((a, b) => a.bairro_nome.localeCompare(b.bairro_nome));

  selectBairroEl.innerHTML = `
    <option value="">- Selecione seu bairro ou quadra -</option>
    ${sorted.map(b => `
      <option value="${b.bairro_id}" ${appState.selectedBairro?.bairro_id === b.bairro_id ? 'selected' : ''}>
        ${b.bairro_nome} (Taxa: R$ ${parseFloat(b.taxaentrega).toFixed(2).replace('.', ',')})
      </option>
    `).join('')}
  `;

  selectBairroEl.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val) return;

    const chosen = data.bairros.find(b => b.bairro_id === val);
    if (chosen) {
      appState.selectedBairro = chosen;
      appState.deliveryFee = parseFloat(chosen.taxaentrega) || 0;

      // Localiza a filial correspondente ao bairro
      const filial = data.filiais.find(f => f.filialid === chosen.filial_id);
      if (filial) {
        appState.selectedFilial = filial;
      }

      updateHeaderStoreInfo();
      updateCartUI();
      showToast(`Região atualizada para ${chosen.bairro_nome}!`);
      closeModal('bairro-modal');
    }
  });
}

// Renderiza Cards das Filiais (Visual Expresso Delivery)
function renderFiliaisCards() {
  const container = document.getElementById('expresso-filiais-container');
  if (!container) return;

  const data = window.PIZZARIA_DATA;
  if (!data || !data.filiais) return;

  container.innerHTML = data.filiais.map(f => `
    <div class="expresso-card p-6 flex flex-col justify-between cursor-pointer border border-white/10 hover:border-red-600 transition-all rounded-xl" onclick="selectFilial('${f.filialid}')">
      <div>
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
            <i data-lucide="store" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-bold text-white text-base">${f.descricaofilial}</h4>
            <span class="text-xs text-emerald-400 flex items-center gap-1">● Aberto para Pedidos</span>
          </div>
        </div>
        <p class="text-xs text-gray-400 mb-2 flex items-start gap-1.5">
          <i data-lucide="map-pin" class="w-4 h-4 text-gray-500 shrink-0 mt-0.5"></i>
          ${f.enderecocompleto}
        </p>
        <p class="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <i data-lucide="phone" class="w-4 h-4 text-gray-500 shrink-0"></i>
          ${f.telefone}
        </p>
      </div>

      <button class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2">
        <i data-lucide="shopping-bag" class="w-4 h-4"></i>
        Fazer Pedido nesta Unidade
      </button>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function selectFilial(filialId) {
  const data = window.PIZZARIA_DATA;
  const filial = data.filiais.find(f => f.filialid === filialId);
  if (filial) {
    appState.selectedFilial = filial;
    updateHeaderStoreInfo();
    showToast(`Unidade selecionada: ${filial.descricaofilial}`);
    switchTab('modern');
  }
}

// Modal de Personalização da Pizza
function openPizzaModal(productId) {
  const data = window.PIZZARIA_DATA;
  const pizza = data.products.find(p => p.id === productId);
  if (!pizza) return;

  appState.customizingPizza = {
    basePizza: pizza,
    size: 'grande', // 'broto' ou 'grande'
    type: 'inteira', // 'inteira' ou 'meio_a_meio'
    flavor2: null,
    borda: 'nenhuma',
    molhoExtra: false,
    obs: '',
    quantity: 1
  };

  const modal = document.getElementById('pizza-customizer-modal');
  if (!modal) return;

  document.getElementById('modal-pizza-title').textContent = pizza.name;
  document.getElementById('modal-pizza-desc').textContent = pizza.ingredients;
  document.getElementById('modal-pizza-price-display').textContent = `R$ ${pizza.price.toFixed(2).replace('.', ',')}`;

  // Preenche opções de 2º sabor
  const selectFlavor2 = document.getElementById('modal-select-flavor2');
  if (selectFlavor2) {
    const allPizzas = data.products.filter(p => ['populares', 'tradicionais', 'especiais', 'doces'].includes(p.category));
    selectFlavor2.innerHTML = `
      <option value="">- Selecione o 2º sabor -</option>
      ${allPizzas.map(p => `
        <option value="${p.id}">${p.name} (R$ ${p.price.toFixed(2).replace('.', ',')})</option>
      `).join('')}
    `;
  }

  // Preenche bordas
  const bordasContainer = document.getElementById('modal-bordas-options');
  if (bordasContainer) {
    const bordas = data.products.filter(p => p.category === 'bordas');
    bordasContainer.innerHTML = `
      <label class="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer hover:border-gold/50 transition-colors">
        <div class="flex items-center gap-2.5">
          <input type="radio" name="custom-borda" value="nenhuma" checked onchange="updateCustomizerCalculations()" class="accent-amber-500" />
          <span class="text-xs text-white">Sem borda recheada (Massa tradicional)</span>
        </div>
        <span class="text-xs text-gray-500">Grátis</span>
      </label>
      ${bordas.map(b => `
        <label class="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer hover:border-gold/50 transition-colors">
          <div class="flex items-center gap-2.5">
            <input type="radio" name="custom-borda" value="${b.id}" onchange="updateCustomizerCalculations()" class="accent-amber-500" />
            <span class="text-xs text-white">Borda de ${b.name}</span>
          </div>
          <span class="text-xs font-semibold text-gradient-gold">+ R$ ${b.price.toFixed(2).replace('.', ',')}</span>
        </label>
      `).join('')}
    `;
  }

  // Reseta campos
  document.getElementById('custom-size-grande').checked = true;
  document.getElementById('custom-type-inteira').checked = true;
  document.getElementById('flavor2-section').classList.add('hidden');
  document.getElementById('custom-molho-verde').checked = false;
  document.getElementById('custom-pizza-obs').value = '';
  document.getElementById('custom-qty-display').textContent = '1';

  updateCustomizerCalculations();
  openModal('pizza-customizer-modal');
}

// Atualiza cálculos do modal customizador
function updateCustomizerCalculations() {
  if (!appState.customizingPizza) return;

  const data = window.PIZZARIA_DATA;
  const p1 = appState.customizingPizza.basePizza;

  // Tamanho
  const isGrande = document.getElementById('custom-size-grande').checked;
  appState.customizingPizza.size = isGrande ? 'grande' : 'broto';

  // Meio a meio
  const isMeioAMeio = document.getElementById('custom-type-meio').checked;
  const flavor2Section = document.getElementById('flavor2-section');

  let basePrice = p1.price;

  if (isMeioAMeio) {
    flavor2Section.classList.remove('hidden');
    const f2Id = document.getElementById('modal-select-flavor2').value;
    const f2 = data.products.find(p => p.id === f2Id);
    appState.customizingPizza.flavor2 = f2 || null;

    if (f2) {
      // Regra de pizzaria: cobra pelo sabor de maior valor
      basePrice = Math.max(p1.price, f2.price);
    }
  } else {
    flavor2Section.classList.add('hidden');
    appState.customizingPizza.flavor2 = null;
  }

  // Ajuste tamanho broto (desconto de R$ 5,00)
  if (!isGrande) {
    basePrice = Math.max(20.00, basePrice - 5.00);
  }

  // Borda
  const selectedBordaRadio = document.querySelector('input[name="custom-borda"]:checked');
  const bordaId = selectedBordaRadio ? selectedBordaRadio.value : 'nenhuma';
  let bordaPrice = 0;
  if (bordaId !== 'nenhuma') {
    const bordaObj = data.products.find(p => p.id === bordaId);
    if (bordaObj) {
      bordaPrice = bordaObj.price;
      appState.customizingPizza.borda = bordaObj;
    }
  } else {
    appState.customizingPizza.borda = null;
  }

  // Molho Verde Extra (+ R$ 4,00)
  const molhoChecked = document.getElementById('custom-molho-verde').checked;
  const molhoPrice = molhoChecked ? 4.00 : 0.00;
  appState.customizingPizza.molhoExtra = molhoChecked;

  const totalUnit = basePrice + bordaPrice + molhoPrice;
  const qty = appState.customizingPizza.quantity;
  const total = totalUnit * qty;

  document.getElementById('modal-pizza-price-display').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Altera quantidade no modal
function changeCustomQty(delta) {
  if (!appState.customizingPizza) return;
  let q = appState.customizingPizza.quantity + delta;
  if (q < 1) q = 1;
  appState.customizingPizza.quantity = q;
  document.getElementById('custom-qty-display').textContent = q.toString();
  updateCustomizerCalculations();
}

// Confirma adição da pizza customizada ao carrinho
function confirmAddPizzaToCart() {
  if (!appState.customizingPizza) return;

  const isMeioAMeio = document.getElementById('custom-type-meio').checked;
  if (isMeioAMeio && !appState.customizingPizza.flavor2) {
    alert('Por favor, selecione o 2º sabor da sua pizza meio a meio!');
    return;
  }

  const p1 = appState.customizingPizza.basePizza;
  const p2 = appState.customizingPizza.flavor2;
  const isGrande = appState.customizingPizza.size === 'grande';
  const borda = appState.customizingPizza.borda;
  const molho = appState.customizingPizza.molhoExtra;
  const obs = document.getElementById('custom-pizza-obs').value.trim();

  let unitPrice = p1.price;
  if (p2) unitPrice = Math.max(p1.price, p2.price);
  if (!isGrande) unitPrice = Math.max(20.00, unitPrice - 5.00);
  if (borda) unitPrice += borda.price;
  if (molho) unitPrice += 4.00;

  const itemTitle = p2 
    ? `Pizza ${isGrande ? 'Grande' : 'Broto'} (Meio ${p1.name} / Meio ${p2.name})`
    : `Pizza ${isGrande ? 'Grande' : 'Broto'} ${p1.name}`;

  const cartItem = {
    id: 'item_' + Date.now(),
    title: itemTitle,
    details: [
      borda ? `Borda de ${borda.name} (+R$ ${borda.price.toFixed(2)})` : 'Sem borda recheada',
      molho ? 'Com Molho Verde da Casa (+R$ 4,00)' : null,
      obs ? `Obs: ${obs}` : null
    ].filter(Boolean).join(' • '),
    price: unitPrice,
    quantity: appState.customizingPizza.quantity
  };

  appState.cart.push(cartItem);
  updateCartUI();
  closeModal('pizza-customizer-modal');
  showToast(`${cartItem.title} adicionada ao carrinho!`);
}

// Adiciona item simples (bebidas/molhos) direto ao carrinho
function addSimpleItemToCart(productId) {
  const data = window.PIZZARIA_DATA;
  const product = data.products.find(p => p.id === productId);
  if (!product) return;

  const existing = appState.cart.find(item => item.productId === productId && !item.details);
  if (existing) {
    existing.quantity += 1;
  } else {
    appState.cart.push({
      id: 'item_' + Date.now(),
      productId: product.id,
      title: product.name,
      details: product.ingredients || '',
      price: product.price,
      quantity: 1
    });
  }

  updateCartUI();
  showToast(`${product.name} adicionado ao carrinho!`);
}

// Atualiza interface do carrinho
function updateCartUI() {
  const countEls = document.querySelectorAll('.cart-count-badge');
  const totalCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0);

  countEls.forEach(el => {
    el.textContent = totalCount.toString();
    el.classList.toggle('hidden', totalCount === 0);
  });

  const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = appState.deliveryType === 'delivery' ? appState.deliveryFee : 0;
  const total = subtotal + delivery;

  // Atualiza gaveta do carrinho
  const cartItemsContainer = document.getElementById('cart-items-list');
  const cartEmptyEl = document.getElementById('cart-empty-message');
  const cartSummaryEl = document.getElementById('cart-summary-section');

  if (cartItemsContainer) {
    if (appState.cart.length === 0) {
      cartItemsContainer.innerHTML = '';
      if (cartEmptyEl) cartEmptyEl.classList.remove('hidden');
      if (cartSummaryEl) cartSummaryEl.classList.add('hidden');
    } else {
      if (cartEmptyEl) cartEmptyEl.classList.add('hidden');
      if (cartSummaryEl) cartSummaryEl.classList.remove('hidden');

      cartItemsContainer.innerHTML = appState.cart.map((item, index) => `
        <div class="p-3.5 rounded-xl bg-zinc-900/90 border border-white/5 flex items-start justify-between gap-3">
          <div class="flex-1">
            <h5 class="font-bold text-sm text-white mb-0.5">${item.title}</h5>
            ${item.details ? `<p class="text-[11px] text-gray-400 mb-2 leading-tight">${item.details}</p>` : ''}
            <span class="text-xs font-bold text-gold">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
          </div>

          <div class="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
            <button onclick="updateCartItemQty(${index}, -1)" class="text-gray-400 hover:text-white p-0.5 cursor-pointer">
              <i data-lucide="minus" class="w-3.5 h-3.5"></i>
            </button>
            <span class="text-xs font-bold text-white min-w-[16px] text-center">${item.quantity}</span>
            <button onclick="updateCartItemQty(${index}, 1)" class="text-gray-400 hover:text-white p-0.5 cursor-pointer">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  // Atualiza totais
  const subtotalEl = document.getElementById('cart-subtotal');
  const feeEl = document.getElementById('cart-delivery-fee');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  if (feeEl) feeEl.textContent = delivery === 0 ? 'Grátis' : `R$ ${delivery.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

  if (window.lucide) window.lucide.createIcons();
}

function updateCartItemQty(index, delta) {
  if (!appState.cart[index]) return;
  appState.cart[index].quantity += delta;
  if (appState.cart[index].quantity <= 0) {
    appState.cart.splice(index, 1);
  }
  updateCartUI();
}

// Modal and Drawer Controls
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) {
    drawer.classList.toggle('hidden');
  }
}

// Switch between Modern Delivery and Expresso Delivery Replica
function switchTab(tab) {
  appState.activeTab = tab;
  const modernView = document.getElementById('modern-view');
  const expressoView = document.getElementById('expresso-view');
  const tabModernBtn = document.getElementById('tab-btn-modern');
  const tabExpressoBtn = document.getElementById('tab-btn-expresso');

  if (tab === 'modern') {
    modernView?.classList.remove('hidden');
    expressoView?.classList.add('hidden');
    tabModernBtn?.classList.add('bg-gold', 'text-black', 'font-bold');
    tabModernBtn?.classList.remove('text-gray-400');
    tabExpressoBtn?.classList.remove('bg-gold', 'text-black', 'font-bold');
    tabExpressoBtn?.classList.add('text-gray-400');
  } else {
    modernView?.classList.add('hidden');
    expressoView?.classList.remove('hidden');
    tabExpressoBtn?.classList.add('bg-gold', 'text-black', 'font-bold');
    tabExpressoBtn?.classList.remove('text-gray-400');
    tabModernBtn?.classList.remove('bg-gold', 'text-black', 'font-bold');
    tabModernBtn?.classList.add('text-gray-400');
  }
}

// Envia Pedido via WhatsApp
function openCheckoutModal() {
  if (appState.cart.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  toggleCartDrawer();
  openModal('checkout-modal');
}

function finalizeWhatsAppOrder() {
  const name = document.getElementById('checkout-name')?.value.trim();
  const phone = document.getElementById('checkout-phone')?.value.trim();
  const street = document.getElementById('checkout-street')?.value.trim();
  const num = document.getElementById('checkout-num')?.value.trim();
  const comp = document.getElementById('checkout-comp')?.value.trim();
  const paymentMethod = document.querySelector('input[name="checkout-payment"]:checked')?.value || 'PIX';
  const troco = document.getElementById('checkout-troco')?.value.trim();

  if (!name || !phone) {
    alert('Por favor, preencha seu nome e telefone!');
    return;
  }

  if (appState.deliveryType === 'delivery' && (!street || !num)) {
    alert('Por favor, informe a rua/quadra e o número para a entrega!');
    return;
  }

  const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = appState.deliveryType === 'delivery' ? appState.deliveryFee : 0;
  const total = subtotal + delivery;
  const filial = appState.selectedFilial || { descricaofilial: "Matriz Brasília", telefone: "(61) 99646-9284" };
  const targetPhone = "5561996469284"; // WhatsApp de pedidos central

  // Formatação do ticket
  let msg = `🍕 *NOVO PEDIDO - PIZZARIA PAULISTANA*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Cliente:* ${name}\n`;
  msg += `📱 *Telefone:* ${phone}\n`;
  msg += `🏬 *Unidade:* ${filial.descricaofilial}\n`;
  msg += `🛵 *Tipo:* ${appState.deliveryType === 'delivery' ? 'Entrega em domicílio' : 'Retirada no balcão'}\n`;
  
  if (appState.deliveryType === 'delivery') {
    msg += `📍 *Endereço:* ${street}, Nº ${num}${comp ? ` (${comp})` : ''}\n`;
    msg += `🏙️ *Bairro:* ${appState.selectedBairro?.bairro_nome || 'Brasília'}\n`;
  }
  
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *ITENS DO PEDIDO:*\n\n`;

  appState.cart.forEach((item, idx) => {
    msg += `*${item.quantity}x* ${item.title}\n`;
    if (item.details) msg += `   ↳ ${item.details}\n`;
    msg += `   Valor: R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
  msg += `🛵 *Taxa de Entrega:* ${delivery === 0 ? 'Grátis' : `R$ ${delivery.toFixed(2).replace('.', ',')}`}\n`;
  msg += `🧾 *TOTAL:* *R$ ${total.toFixed(2).replace('.', ',')}*\n`;
  msg += `💳 *Forma de Pagamento:* ${paymentMethod}${paymentMethod === 'Dinheiro' && troco ? ` (Troco para R$ ${troco})` : ''}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Pedido gerado via Plataforma Paulistana Delivery Online_`;

  const encodedMsg = encodeURIComponent(msg);
  const waUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

  // Abre o WhatsApp
  window.open(waUrl, '_blank');

  // Limpa carrinho e avisa
  appState.cart = [];
  updateCartUI();
  closeModal('checkout-modal');
  showToast('Pedido enviado para o WhatsApp com sucesso!');
}

// Toast notification
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) return;

  toast.querySelector('#toast-text').textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Event Listeners
function setupEventListeners() {
  // Category tabs
  const catButtons = document.querySelectorAll('[data-category]');
  catButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.activeCategory = btn.getAttribute('data-category');
      renderProducts();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Delivery / Retirada toggle
  const deliveryRadio = document.getElementById('checkout-type-delivery');
  const retiradaRadio = document.getElementById('checkout-type-retirada');
  const addressSection = document.getElementById('checkout-address-section');

  if (deliveryRadio && retiradaRadio) {
    deliveryRadio.addEventListener('change', () => {
      appState.deliveryType = 'delivery';
      addressSection?.classList.remove('hidden');
      updateCartUI();
    });
    retiradaRadio.addEventListener('change', () => {
      appState.deliveryType = 'retirada';
      addressSection?.classList.add('hidden');
      updateCartUI();
    });
  }

  // Payment method dinhero troco toggle
  const paymentRadios = document.querySelectorAll('input[name="checkout-payment"]');
  const trocoSection = document.getElementById('troco-section');
  paymentRadios.forEach(r => {
    r.addEventListener('change', (e) => {
      if (e.target.value === 'Dinheiro') {
        trocoSection?.classList.remove('hidden');
      } else {
        trocoSection?.classList.add('hidden');
      }
    });
  });
}
