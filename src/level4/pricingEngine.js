'use strict';

const REGION_TAX = { EU: 0.21, UK: 0.2, US: 0.07, OTHER: 0 };
const FX_RATES = { EUR: 1, USD: 1.08, GBP: 0.86 };

function simpleQuote(basePrice, quantity) {
  return Math.round(basePrice * quantity * 100) / 100;
}

function calculateQuote(basePrice, quantity, customerTier, region, couponCode, season, isBulk, currency, taxExempt) {
  let price = basePrice * quantity;
  let discount = 0;

  if (customerTier === 'gold') {
    if (quantity >= 100) {
      discount = 0.2;
    } else if (quantity >= 50) {
      if (season === 'winter') {
        discount = 0.18;
      } else if (season === 'summer') {
        if (isBulk) {
          discount = 0.17;
        } else {
          discount = 0.15;
        }
      } else {
        discount = 0.16;
      }
    } else if (quantity >= 10) {
      if (season === 'winter' && isBulk) {
        discount = 0.12;
      } else if (season === 'winter') {
        discount = 0.1;
      } else {
        discount = 0.08;
      }
    } else {
      discount = 0.05;
    }
  } else if (customerTier === 'silver') {
    if (quantity >= 100) {
      discount = 0.15;
    } else if (quantity >= 50) {
      if (season === 'winter') {
        discount = 0.12;
      } else if (isBulk) {
        discount = 0.11;
      } else {
        discount = 0.1;
      }
    } else if (quantity >= 10) {
      if (isBulk) {
        discount = 0.07;
      } else {
        discount = 0.05;
      }
    }
  } else if (customerTier === 'bronze') {
    if (quantity >= 100) {
      discount = 0.1;
    } else if (quantity >= 25) {
      discount = isBulk ? 0.06 : 0.04;
    }
  } else {
    if (quantity >= 200) {
      discount = 0.05;
    }
  }

  if (couponCode) {
    if (couponCode === 'SPRING5') {
      if (season === 'spring') {
        discount += 0.05;
      }
    } else if (couponCode === 'LOYAL10') {
      if (customerTier === 'gold' || customerTier === 'silver') {
        discount += 0.1;
      } else if (customerTier === 'bronze') {
        discount += 0.05;
      }
    } else if (couponCode === 'CLEARANCE') {
      if (quantity > 20 && !isBulk) {
        discount += 0.15;
      } else if (quantity > 5) {
        discount += 0.07;
      }
    }
  }

  if (discount > 0.35) {
    discount = 0.35;
  }

  price = price - price * discount;

  if (!taxExempt) {
    if (region === 'EU') {
      price = price * (1 + REGION_TAX.EU);
    } else if (region === 'UK') {
      price = price * (1 + REGION_TAX.UK);
    } else if (region === 'US') {
      if (price > 1000) {
        price = price * (1 + REGION_TAX.US + 0.01);
      } else {
        price = price * (1 + REGION_TAX.US);
      }
    } else {
      price = price * (1 + REGION_TAX.OTHER);
    }
  }

  if (currency && currency !== 'EUR') {
    if (FX_RATES[currency]) {
      price = price * FX_RATES[currency];
    } else {
      throw new Error('Unsupported currency ' + currency);
    }
  }

  return Math.round(price * 100) / 100;
}

module.exports = { simpleQuote, calculateQuote };
