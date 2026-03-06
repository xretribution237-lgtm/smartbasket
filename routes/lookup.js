const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  next();
};

const categoryPrices = {
  produce: 1.99, dairy: 3.49, meat: 6.99, frozen: 4.49,
  pantry: 2.49, snacks: 3.99, beverages: 2.99, bread: 3.29,
  bakery: 4.99, cereal: 4.29, condiments: 2.99, cleaning: 3.99,
  personal: 4.49, pet: 7.99, baby: 8.99, food: 3.99
};

function defaultPrice(category) {
  return (category && categoryPrices[category.toLowerCase()]) || 2.99;
}

router.get('/barcode/:code', auth, async (req, res) => {
  try {
    const { code } = req.params;

    // Open Food Facts (free, no key)
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`, {
      headers: { 'User-Agent': 'SmartBasket/1.0' }
    });
    const offData = await offRes.json();

    if (offData.status === 1 && offData.product) {
      const p = offData.product;
      const rawCat = p.categories_tags?.[0]?.replace('en:', '') || 'food';
      const category = rawCat.replace(/-/g, ' ').split(',')[0].trim();
      return res.json({
        found: true,
        name: p.product_name || p.product_name_en || 'Unknown Product',
        brand: p.brands || '',
        category,
        imageUrl: p.image_front_url || null,
        barcode: code,
        estimatedPrice: defaultPrice(category)
      });
    }

    // UPC Item DB fallback (free tier)
    try {
      const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
      const upcData = await upcRes.json();
      if (upcData.items && upcData.items.length > 0) {
        const item = upcData.items[0];
        const category = item.category || 'general';
        return res.json({
          found: true,
          name: item.title,
          brand: item.brand || '',
          category,
          imageUrl: item.images?.[0] || null,
          barcode: code,
          estimatedPrice: item.offers?.[0]?.price || defaultPrice(category)
        });
      }
    } catch (e) { /* fallthrough */ }

    res.json({ found: false, barcode: code });
  } catch (err) {
    res.json({ found: false, barcode: req.params.code });
  }
});

module.exports = router;
