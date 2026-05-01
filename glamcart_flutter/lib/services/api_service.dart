import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  void init() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('glamcart_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          SharedPreferences.getInstance().then((prefs) {
            prefs.remove('glamcart_token');
            prefs.remove('glamcart_user');
          });
        }
        handler.next(error);
      },
    ));
  }

  // Auth
  Future<Response> login(String email, String password) =>
      _dio.post('/auth/login', data: {'email': email, 'password': password});

  Future<Response> register(String name, String email, String password) =>
      _dio.post('/auth/register', data: {'name': name, 'email': email, 'password': password});

  Future<Response> getMe() => _dio.get('/auth/me');

  // Products
  Future<Response> getProducts({Map<String, dynamic>? params}) =>
      _dio.get('/products', queryParameters: params);

  Future<Response> getProduct(String slug) => _dio.get('/products/$slug');

  // Categories
  Future<Response> getCategories() => _dio.get('/categories');

  // Cart
  Future<Response> getCart() => _dio.get('/cart');
  Future<Response> addToCart(int productId, {int quantity = 1}) =>
      _dio.post('/cart', data: {'productId': productId, 'quantity': quantity});
  Future<Response> updateCartItem(int productId, int quantity) =>
      _dio.patch('/cart/$productId', data: {'quantity': quantity});
  Future<Response> removeFromCart(int productId) => _dio.delete('/cart/$productId');
  Future<Response> clearCart() => _dio.delete('/cart');

  // Wishlist
  Future<Response> getWishlist() => _dio.get('/wishlist');
  Future<Response> addToWishlist(int productId) =>
      _dio.post('/wishlist', data: {'productId': productId});
  Future<Response> removeFromWishlist(int productId) => _dio.delete('/wishlist/$productId');

  // Orders
  Future<Response> getOrders() => _dio.get('/orders');
  Future<Response> getOrder(int id) => _dio.get('/orders/$id');
  Future<Response> placeOrder(Map<String, dynamic> data) => _dio.post('/orders', data: data);

  // Addresses
  Future<Response> getAddresses() => _dio.get('/users/addresses');
  Future<Response> addAddress(Map<String, dynamic> data) => _dio.post('/users/addresses', data: data);

  // Payments
  Future<Response> createRazorpayOrder(double amount) =>
      _dio.post('/payments/create-order', data: {'amount': amount});
  Future<Response> verifyPayment(Map<String, dynamic> data) => _dio.post('/payments/verify', data: data);

  // Coupons
  Future<Response> validateCoupon(String code, double orderAmount) =>
      _dio.post('/coupons/validate', data: {'code': code, 'orderAmount': orderAmount});
}
