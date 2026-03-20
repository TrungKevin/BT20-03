const express = require('express');
const router = express.Router();
const Inventory = require('../schemas/inventories');
const Product = require('../schemas/products');

// 1. Lấy toàn bộ kho hàng
router.get('/', async (req, res) => {
  try {
    const inventories = await Inventory.find({});
    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Lấy chi tiết kho hàng theo ID và ghép thông tin sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('product');
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Tăng số lượng tồn kho
router.post('/add_stock', async (req, res) => {
  const { product, quantity } = req.body;
  if (!product || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  try {
    const result = await Inventory.findOneAndUpdate(
      { product },
      { $inc: { stock: quantity } },
      { new: true }
    );
    if (!result) return res.status(404).json({ message: 'Inventory not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Giảm số lượng tồn kho / Xuất kho
router.post('/remove_stock', async (req, res) => {
  const { product, quantity } = req.body;
  if (!product || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  try {
    const inventory = await Inventory.findOne({ product });
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
    if (inventory.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }
    inventory.stock -= quantity;
    await inventory.save();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Người dùng Đặt hàng (reservation)
router.post('/reservation', async (req, res) => {
  const { product, quantity } = req.body;
  if (!product || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  try {
    const inventory = await Inventory.findOne({ product });
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
    if (inventory.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock to reserve' });
    }
    inventory.stock -= quantity;
    inventory.reserved += quantity;
    await inventory.save();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Hoàn tất bán hàng (sold)
router.post('/sold', async (req, res) => {
  const { product, quantity } = req.body;
  if (!product || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  try {
    const inventory = await Inventory.findOne({ product });
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
    if (inventory.reserved < quantity) {
      return res.status(400).json({ message: 'Not enough reserved items to sell' });
    }
    inventory.reserved -= quantity;
    inventory.soldCount += quantity;
    await inventory.save();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
