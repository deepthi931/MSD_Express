const express = require('express');

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'products.json');

app.use(express.json());

function readProducts() {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function writeProducts(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

app.get('/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.get('/products/instock', (req, res) => {
  const products = readProducts();
  const inStock = products.filter(p => p.inStock);
  res.json(inStock);
});

app.post('/products', (req, res) => {
  const { name, price, inStock } = req.body;

  if (!name || typeof price !== 'number' || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  const products = readProducts();
  const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const newProduct = { id: newId, name, price, inStock };
  products.push(newProduct);

  writeProducts(products);
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let products = readProducts();
  const index = products.findIndex(p => p.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[index] = { ...products[index], ...updates };
  writeProducts(products);

  res.json(products[index]);
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  let products = readProducts();

  const index = products.findIndex(p => p.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deleted = products.splice(index, 1);
  writeProducts(products);

  res.json({ message: 'Product deleted successfully', product: deleted[0] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
