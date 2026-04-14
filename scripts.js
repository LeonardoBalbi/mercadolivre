
let products = window.__PRODUCTS__ || []

const fallbackProducts = [
    {
        id: 1,
        title: "Smartphone Samsung Galaxy A54",
        price: 1899.99,
        discount: 15,
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop"
    },
    {
        id: 2,
        title: "Notebook Lenovo IdeaPad",
        price: 2999.90,
        discount: 20,
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop"
    },
    {
        id: 3,
        title: "Smart TV LG 50 4K",
        price: 2299.00,
        discount: 10,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop"
    },
    {
        id: 4,
        title: "Tênis Nike Air Max",
        price: 399.99,
        discount: 25,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
    },
    {
        id: 5,
        title: "Fone JBL Bluetooth",
        price: 199.90,
        discount: 30,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
    },
    {
        id: 6,
        title: "Cadeira Gamer ThunderX3",
        price: 899.00,
        discount: 18,
        image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop"
    },
    {
        id: 7,
        title: "Console PlayStation 5",
        price: 3999.99,
        discount: 5,
        image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop"
    },
    {
        id: 8,
        title: "Apple Watch Series 8",
        price: 2899.00,
        discount: 12,
        image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop"
    },
    {
        id: 9,
        title: "Tablet Samsung Galaxy Tab",
        price: 2199.90,
        discount: 15,
        image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop"
    },
    {
        id: 10,
        title: "Câmera Canon EOS Rebel",
        price: 2699.00,
        discount: 8,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop"
    },
    {
        id: 11,
        title: "Mouse Gamer Logitech",
        price: 249.90,
        discount: 20,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"
    },
    {
        id: 12,
        title: "Teclado Mecânico RGB",
        price: 449.90,
        discount: 22,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop"
    }
]

function formatPrice(price) {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}


function createProductCard(product) {
    return `
            <a href="/products/${product.id}" class="product-card" style="text-decoration:none;color:inherit;">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-discount">${product.discount}% OFF</div>
            </a>
    `
}

function renderProduct(products) {
    const grid = document.getElementById('productsGrid')
    if (!grid) return
    grid.innerHTML = products.map(createProductCard).join('')

    // join -> juntar todo mundo
    // innerHTML -> injetar, colocar algo no HTML
    // map -> mapeia, percorre o array, pegando produto por produto
}

function searchProducts(){
   const val = document.getElementById('searchInput').value.trim()
   if (!val) return
   window.location.href = `/search?q=${encodeURIComponent(val)}`
}



async function loadProducts(){
    const p = window.location.pathname || ''
    const allow = p === '/' || p.startsWith('/search') || p.startsWith('/lista')
    if (!allow) return
    if (products.length) {
        renderProduct(products)
        return
    }
    try {
        const res = await fetch('http://localhost:3000/api/products')
        if (res.ok) {
            products = await res.json()
        }
    } catch (e) {}
    const base = products.length ? products : fallbackProducts
    renderProduct(base)
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts()
    const sb = document.getElementById('searchBtn')
    if (sb) sb.addEventListener('click', searchProducts)
    initUserDropdown()
    initProductSelectFilters()
})

function initUserDropdown(){
  const btn = document.getElementById('userMenuBtn')
  const menu = document.getElementById('userMenu')
  if (!btn || !menu) return
  const toggle = () => {
    const cur = menu.style.display
    menu.style.display = cur === 'block' ? 'none' : 'block'
  }
  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle()
  })
  document.addEventListener('click', () => {
    if (menu.style.display === 'block') menu.style.display = 'none'
  })
}

function initProductSelectFilters(){
  const pairs = [
    ['questionsProductFilter','questionsProductSelect'],
    ['reviewsProductFilter','reviewsProductSelect'],
  ]
  for (const [fId, sId] of pairs) {
    const f = document.getElementById(fId)
    const s = document.getElementById(sId)
    if (f && s) attachSelectFilter(f, s)
  }
  const giftFilters = document.querySelectorAll('.giftFilter')
  giftFilters.forEach(f => {
    const targetId = f.getAttribute('data-select-filter-for')
    if (!targetId) return
    const s = document.getElementById(targetId)
    if (s) attachSelectFilter(f, s)
  })
  initProductAutocomplete()
  applyPersistedFilter()
}

function attachSelectFilter(filterInput, selectEl){
  const original = Array.from(selectEl.querySelectorAll('option')).map(o => ({ value: o.value, text: o.textContent }))
  const rebuild = (term) => {
    const lc = (term || '').toLowerCase()
    const filtered = lc ? original.filter(o => o.text.toLowerCase().includes(lc)) : original
    selectEl.innerHTML = ''
    for (const o of filtered) {
      const opt = document.createElement('option')
      opt.value = o.value
      opt.textContent = o.text
      selectEl.appendChild(opt)
    }
  }
  const onInput = () => {
    const v = filterInput.value
    rebuild(v)
    updateQueryParam('pf', v)
  }
  rebuild(filterInput.value)
  filterInput.addEventListener('input', onInput)
}

function initProductAutocomplete(){
  const acPairs = [
    ['questionsProductAC','questionsProductSelect'],
    ['reviewsProductAC','reviewsProductSelect'],
  ]
  for (const [acId, selId] of acPairs) {
    const ac = document.getElementById(acId)
    const sel = document.getElementById(selId)
    if (!ac || !sel) continue
    ac.addEventListener('change', () => setSelectByText(sel, ac.value))
    ac.addEventListener('input', (e) => {
      if (e.inputType === 'insertReplacementText') setSelectByText(sel, ac.value)
    })
  }
  const giftAcs = document.querySelectorAll('.giftAC')
  giftAcs.forEach(ac => {
    const selId = ac.getAttribute('data-select-for')
    const sel = document.getElementById(selId)
    if (!sel) return
    ac.addEventListener('change', () => setSelectByText(sel, ac.value))
  })
}

function setSelectByText(selectEl, text){
  const lc = (text || '').toLowerCase()
  const opts = Array.from(selectEl.querySelectorAll('option'))
  const found = opts.find(o => o.textContent.toLowerCase() === lc)
  if (found) selectEl.value = found.value
}

function updateQueryParam(key, value){
  const url = new URL(window.location.href)
  if (value) url.searchParams.set(key, value)
  else url.searchParams.delete(key)
  window.history.replaceState({}, '', url.toString())
}

function applyPersistedFilter(){
  const url = new URL(window.location.href)
  const pf = url.searchParams.get('pf') || ''
  if (!pf) return
  const inputs = [
    document.getElementById('questionsProductFilter'),
    document.getElementById('reviewsProductFilter'),
  ]
  inputs.forEach(inp => {
    if (!inp) return
    inp.value = pf
    const selId = inp.id === 'questionsProductFilter' ? 'questionsProductSelect' : (inp.id === 'reviewsProductFilter' ? 'reviewsProductSelect' : null)
    if (selId) {
      const s = document.getElementById(selId)
      if (s) attachSelectFilter(inp, s)
    }
  })
  const giftFilters = document.querySelectorAll('.giftFilter')
  giftFilters.forEach(inp => {
    inp.value = pf
    const targetId = inp.getAttribute('data-select-filter-for')
    const s = targetId && document.getElementById(targetId)
    if (s) attachSelectFilter(inp, s)
  })
}

