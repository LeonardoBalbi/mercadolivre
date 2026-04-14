CREATE DATABASE IF NOT EXISTS mercadolivre;
USE mercadolivre;

DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount INT NOT NULL,
  image VARCHAR(500) NOT NULL
);

INSERT INTO products (title, price, discount, image) VALUES
('Smartphone Samsung Galaxy A54', 1899.99, 15, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop'),
('Notebook Lenovo IdeaPad', 2999.90, 20, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop'),
('Smart TV LG 50 4K', 2299.00, 10, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop'),
('Tênis Nike Air Max', 399.99, 25, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'),
('Fone JBL Bluetooth', 199.90, 30, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'),
('Cadeira Gamer ThunderX3', 899.00, 18, 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop'),
('Console PlayStation 5', 3999.99, 5, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop'),
('Apple Watch Series 8', 2899.00, 12, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop'),
('Tablet Samsung Galaxy Tab', 2199.90, 15, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop'),
('Câmera Canon EOS Rebel', 2699.00, 8, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop'),
('Mouse Gamer Logitech', 249.90, 20, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'),
('Teclado Mecânico RGB', 449.90, 22, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop');