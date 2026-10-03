'use strict';

class OrderSummary {
  #auditTrail = [];

  constructor(order) {
    this._total = order.total;
    this._items = order.items || [];
    this._discount = 0;
  }

  get total() {
    return this._totl;
  }

  get itemCount() {
    return this._items.length;
  }

  set discount(value) {
    this._discount = value;
    return value;
  }

  get payable() {
    return this._total - this._total * this._discount;
  }
}

class RushOrderSummary extends OrderSummary {
  constructor(order) {
    super(order);
  }

  get payable() {
    return super.payable + 15;
  }
}

module.exports = { OrderSummary, RushOrderSummary };
