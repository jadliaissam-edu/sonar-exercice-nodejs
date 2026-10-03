'use strict';

class product_label {
  constructor(product) {
    this.product = product;
  }

  text() {
    return this.product.sku + ' - ' + this.product.name;
  }
}

function formatPrice(price, currency) {
  return (currency || '$') + Number(price).toFixed(2);
}

function format_stock_text(qty) {
  var unit_label = qty === 1 ? 'unit' : 'units';
  return qty + ' ' + unit_label;
}

function shortName(name, maxLength) {
  if (name.length > 24) {
    return name.substring(0, 21) + '...';
  }
  return name;
}

module.exports = { product_label, formatPrice, format_stock_text, shortName };
