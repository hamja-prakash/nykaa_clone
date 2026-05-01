import 'package:flutter/material.dart';
import '../models/cart_item.dart';
import '../services/api_service.dart';

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  bool _loading = false;

  List<CartItem> get items => _items;
  bool get loading => _loading;
  int get count => _items.fold(0, (s, i) => s + i.quantity);
  double get total => _items.fold(0.0, (s, i) => s + i.total);

  final _api = ApiService();

  Future<void> fetchCart() async {
    _loading = true;
    notifyListeners();
    try {
      final res = await _api.getCart();
      final data = res.data;
      final list = data is List ? data : (data['items'] ?? data['cart'] ?? []);
      _items = (list as List).map((e) => CartItem.fromJson(e)).toList();
    } catch (_) {
      _items = [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> addToCart(int productId) async {
    await _api.addToCart(productId);
    await fetchCart();
  }

  Future<void> updateItem(int productId, int quantity) async {
    await _api.updateCartItem(productId, quantity);
    await fetchCart();
  }

  Future<void> removeItem(int productId) async {
    await _api.removeFromCart(productId);
    _items.removeWhere((i) => i.product.id == productId);
    notifyListeners();
  }

  Future<void> clearCart() async {
    await _api.clearCart();
    _items = [];
    notifyListeners();
  }

  void reset() {
    _items = [];
    notifyListeners();
  }
}
