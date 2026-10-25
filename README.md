# Clone da Pizzaria Paulistana - Reconstrução por Engenharia Reversa

Este projeto é uma reconstrução completa (clone funcional e visual) da plataforma da **Pizzaria Paulistana - Delivery (Brasília-DF)**, realizado através de técnicas de **engenharia reversa com agentes autônomos**, inspirado nas diretrizes do projeto [REA (Reverse Engineer Anything)](https://github.com/morluto/rea).

---

## 🔍 Processo de Engenharia Reversa Realizado

### 1. Descoberta e Recuperação de Tráfego & Bundles
* O domínio original (`pizzariapaulistanadelivery.com.br`) retornou `HTTP 410 Gone`.
* Realizamos a inspeção de snapshots arquivados no Wayback Machine e nos servidores de CDN da plataforma SaaS original (**Expresso Delivery**, servido via Cloudflare e Google Cloud Storage).
* Identificamos a transição do sistema de filiais legadas para a aplicação moderna SPA desenvolvida em Vite/React/Tailwind.

### 2. Extração de Entidades e Modelo de Dados
* **Filiais (Unidades):**
  * **Unidade Asa Sul:** CLS 413 Bloco C, Loja 22 — Tel: (61) 3542-9592 / (61) 98145-4510
  * **Unidade Asa Norte:** CLN 411 Bloco E, Loja 67 — Tel: (61) 3274-0555
  * **Unidade Sudoeste:** CCSW 6, Bloco B/C, Loja 55 — Tel: (61) 3344-7070
  * **Matriz Fazendinha:** Quadra 01, Conjunto J, Lote 15 — Tel: (61) 99646-9284
* **Bairros e Taxas de Entrega:** Mapeamento completo dos **36 bairros atendidos** com suas respectivas taxas de entrega (R$ 0,00 para Plano Piloto e até R$ 8,90 para regiões vizinhas como Guará, Candangolândia e Lago Sul).
* **Cardápio Extraído:** 64 produtos originais categorizados:
  * **Pizzas Populares / Mais Pedidas** (R$ 32,99) — ex: Margherita, Calabresa, Portuguesa, Napolitana.
  * **Pizzas Tradicionais** (R$ 34,99) — ex: Misturada, 4 Queijos, À Moda, Frango Catupiry, Sadia, Caipira.
  * **Pizzas Nobres / Especiais** (R$ 36,99) — ex: Candanga (carne seca), Tomate Seco com Rúcula, Peito de Peru com Cream Cheese, Paulistana.
  * **Pizzas Doces** (R$ 32,99) — ex: Chocolate, Prestígio, Banana com Canela, Banana com Chocolate.
  * **Bebidas** — Refrigerantes 2L (Coca-Cola, Guaraná Kuat, Fanta).
  * **Bordas Recheadas** (R$ 6,00) — Catupiry, Cheddar, Chocolate.
  * **Molhos da Casa** (R$ 4,00) — Molho Verde Especial.
* **Depoimentos e Avaliações:** Extraídos diretamente das reviews autênticas dos clientes.

### 3. Recuperação de Ativos Gráficos (Assets)
* Imagens originais em alta definição baixadas e integradas localmente no diretório `assets/`:
  * Imagem de destaque (Hero)
  * Imagens das categorias de pizzas
  * Galeria artesanal de preparo e fornos
  * Logotipo e banner oficial do Expresso Delivery
  * Biblioteca de ícones Lucide offline

---

## 🚀 Funcionalidades da Aplicação Clonada

1. **Dois Modos de Visualização (Alternância em 1 clique):**
   * **Modo Delivery Moderno:** Interface visual com tema escuro e dourado artesanal (Playfair Display + Tailwind CSS).
   * **Modo Portal Expresso Delivery (Original):** Réplica do layout original de seleção de filiais e bairros do Expresso Delivery.
2. **Personalizador Interativo de Pizzas (Modal Completo):**
   * Escolha de tamanho: **Grande (8 fatias)** ou **Broto (4 fatias)** com recálculo dinâmico de valor.
   * Seleção de **1 sabor (inteira)** ou **2 sabores (Meio a Meio)** com dropdown de combinação e regra de maior valor.
   * Adição de **bordas recheadas** (Catupiry, Cheddar, Chocolate).
   * Adição de **Molho Verde da Casa**.
   * Campo de observações para a cozinha (ex: "sem cebola").
3. **Seletor de Bairros & Filiais com Cálculo de Frete:**
   * Lista dinâmica de bairros de Brasília com identificação automática da filial responsável e da taxa de entrega correspondente.
4. **Carrinho de Compras Interativo (Drawer):**
   * Abertura lateral deslizante, ajuste de quantidades, resumo de subtotal e frete.
5. **Checkout & Gerador de Pedido para WhatsApp:**
   * Coleta de dados (nome, telefone, endereço/retirada, forma de pagamento, troco).
   * Formatação automática de ticket de pedido com emojis e resumo detalhado, pronto para envio direto ao WhatsApp da filial.

---

## 💻 Como Rodar

A aplicação é **100% autônoma** (HTML5 + CSS3 + Vanilla JavaScript), não necessitando de builds ou `node_modules`.

### Opção 1: Abrir diretamente no navegador
Dê um duplo clique no arquivo [`index.html`](index.html).

### Opção 2: Servidor local simples
Se preferir rodar em um servidor web local:

**Com Python:**
```bash
cd "c:\Users\ronci\OneDrive\Documentos\pizzaria-paulistana-clone"
python -m http.server 8080
```
Depois acesse `http://localhost:8080` no navegador.

**Com Node.js (npx):**
```bash
npx serve "c:\Users\ronci\OneDrive\Documentos\pizzaria-paulistana-clone"
```
