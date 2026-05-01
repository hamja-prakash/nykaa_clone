import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../services/api_service.dart';
import '../models/address.dart';
import '../config/api_config.dart';
import '../main.dart';
import 'orders_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _api = ApiService();
  late Razorpay _razorpay;

  List<Address> _addresses = [];
  int? _selectedAddressId;
  String _paymentMethod = 'COD';
  final _couponCtrl = TextEditingController();
  bool _placing = false;
  bool _loadingAddresses = true;

  static const _paymentMethods = [
    {'id': 'COD', 'label': 'Cash on Delivery', 'icon': Icons.local_shipping_outlined},
    {'id': 'UPI', 'label': 'UPI Payment', 'icon': Icons.phone_android_outlined},
    {'id': 'CARD', 'label': 'Credit / Debit Card', 'icon': Icons.credit_card_outlined},
    {'id': 'NETBANKING', 'label': 'Net Banking', 'icon': Icons.account_balance_outlined},
  ];

  @override
  void initState() {
    super.initState();
    _fetchAddresses();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _onExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    _couponCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchAddresses() async {
    try {
      final res = await _api.getAddresses();
      final list = res.data is List ? res.data : (res.data['addresses'] ?? res.data);
      final addresses = (list as List).map((e) => Address.fromJson(e)).toList();
      if (!mounted) return;
      setState(() {
        _addresses = addresses;
        _selectedAddressId = addresses.isNotEmpty
            ? addresses.firstWhere((a) => a.isDefault, orElse: () => addresses.first).id
            : null;
        _loadingAddresses = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingAddresses = false);
    }
  }

  double get _cartTotal => context.read<CartProvider>().total;
  double get _deliveryCharge => _cartTotal >= 499 ? 0 : 49;
  double get _finalTotal => _cartTotal + _deliveryCharge;

  Future<void> _placeOrder() async {
    if (_selectedAddressId == null) {
      _snack('Please select a delivery address', isError: true);
      return;
    }
    if (_paymentMethod != 'COD') {
      await _initiateRazorpay();
      return;
    }
    setState(() => _placing = true);
    try {
      await _api.placeOrder({
        'addressId': _selectedAddressId,
        'paymentMethod': _paymentMethod,
        if (_couponCtrl.text.trim().isNotEmpty) 'couponCode': _couponCtrl.text.trim(),
      });
      if (!mounted) return;
      await context.read<CartProvider>().clearCart();
      if (!mounted) return;
      _snack('Order placed successfully! 🎉');
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const OrdersScreen()),
        (r) => r.isFirst,
      );
    } catch (_) {
      if (mounted) _snack('Failed to place order', isError: true);
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  Future<void> _initiateRazorpay() async {
    setState(() => _placing = true);
    try {
      final res = await _api.createRazorpayOrder(_finalTotal);
      if (!mounted) return;
      final data = res.data;
      final user = context.read<AuthProvider>().user;
      final options = {
        'key': ApiConfig.razorpayKey,
        'amount': data['amount'],
        'currency': data['currency'],
        'name': 'GlamCart',
        'description': 'Order Payment',
        'order_id': data['orderId'],
        'prefill': {
          'contact': user?.phone ?? '',
          'email': user?.email ?? '',
          'name': user?.name ?? '',
        },
        'theme': {'color': '#fc2779'},
      };
      _razorpay.open(options);
    } catch (_) {
      if (mounted) {
        _snack('Failed to initiate payment', isError: true);
        setState(() => _placing = false);
      }
    }
  }

  Future<void> _onPaymentSuccess(PaymentSuccessResponse response) async {
    try {
      await _api.verifyPayment({
        'razorpay_order_id': response.orderId,
        'razorpay_payment_id': response.paymentId,
        'razorpay_signature': response.signature,
      });
      await _api.placeOrder({
        'addressId': _selectedAddressId,
        'paymentMethod': _paymentMethod,
        'razorpayPaymentId': response.paymentId,
        if (_couponCtrl.text.trim().isNotEmpty) 'couponCode': _couponCtrl.text.trim(),
      });
      if (!mounted) return;
      await context.read<CartProvider>().clearCart();
      if (!mounted) return;
      _snack('Payment successful! Order placed 🎉');
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const OrdersScreen()),
        (r) => r.isFirst,
      );
    } catch (_) {
      if (mounted) {
        _snack('Payment received but order failed. Contact support.', isError: true);
        setState(() => _placing = false);
      }
    }
  }

  void _onPaymentError(PaymentFailureResponse response) {
    if (mounted) {
      _snack('Payment failed: ${response.message ?? 'Try again'}', isError: true);
      setState(() => _placing = false);
    }
  }

  void _onExternalWallet(ExternalWalletResponse response) {
    if (mounted) _snack('Wallet selected: ${response.walletName}');
  }

  void _snack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? Colors.red.shade600 : kPink,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: const Text('Checkout'),
      ),
      body: _loadingAddresses
          ? const Center(child: CircularProgressIndicator(color: kPink))
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Delivery Address ──
                  _sectionCard(
                    title: 'Delivery Address',
                    icon: Icons.location_on_outlined,
                    child: _addresses.isEmpty
                        ? const Padding(
                            padding: EdgeInsets.all(8),
                            child: Text('No saved addresses. Add one from your profile.',
                                style: TextStyle(color: Colors.grey, fontSize: 13)),
                          )
                        : Column(
                            children: _addresses.map((addr) => _addressTile(addr)).toList(),
                          ),
                  ),

                  const SizedBox(height: 12),

                  // ── Payment Method ──
                  _sectionCard(
                    title: 'Payment Method',
                    icon: Icons.payment_outlined,
                    child: Column(
                      children: _paymentMethods.map((m) => _paymentTile(m)).toList(),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // ── Coupon ──
                  _sectionCard(
                    title: 'Coupon Code',
                    icon: Icons.local_offer_outlined,
                    child: TextField(
                      controller: _couponCtrl,
                      decoration: InputDecoration(
                        hintText: 'e.g. GLAMCART10',
                        hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                        filled: true,
                        fillColor: const Color(0xFFF5F5F5),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        suffixIcon: const Icon(Icons.local_offer_outlined, color: kPink, size: 20),
                      ),
                      textCapitalization: TextCapitalization.characters,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // ── Order Summary ──
                  _sectionCard(
                    title: 'Order Summary',
                    icon: Icons.receipt_long_outlined,
                    child: Column(
                      children: [
                        ...cart.items.map((item) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      '${item.product.name} × ${item.quantity}',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 13),
                                    ),
                                  ),
                                  Text('₹${item.total.toStringAsFixed(0)}',
                                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                ],
                              ),
                            )),
                        const Divider(height: 16),
                        _summaryRow('Subtotal', '₹${cart.total.toStringAsFixed(0)}'),
                        const SizedBox(height: 4),
                        _summaryRow(
                          'Delivery',
                          _deliveryCharge == 0 ? 'FREE' : '₹${_deliveryCharge.toStringAsFixed(0)}',
                          valueColor: _deliveryCharge == 0 ? Colors.green.shade600 : null,
                        ),
                        const Divider(height: 16),
                        _summaryRow(
                          'Total',
                          '₹${_finalTotal.toStringAsFixed(0)}',
                          isBold: true,
                          valueColor: kPink,
                          fontSize: 17,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 12, offset: const Offset(0, -4)),
          ],
        ),
        child: ElevatedButton(
          onPressed: _placing ? null : _placeOrder,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: _placing
              ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(_paymentMethod == 'COD' ? Icons.local_shipping_outlined : Icons.lock_outlined, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      _paymentMethod == 'COD'
                          ? 'Place Order  ₹${_finalTotal.toStringAsFixed(0)}'
                          : 'Pay ₹${_finalTotal.toStringAsFixed(0)} via Razorpay',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _sectionCard({required String title, required IconData icon, required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                Icon(icon, color: kPink, size: 18),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: kDark)),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(padding: const EdgeInsets.all(14), child: child),
        ],
      ),
    );
  }

  Widget _addressTile(Address addr) => GestureDetector(
        onTap: () => setState(() => _selectedAddressId = addr.id),
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            border: Border.all(
              color: _selectedAddressId == addr.id ? kPink : Colors.grey.shade200,
              width: _selectedAddressId == addr.id ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(10),
            color: _selectedAddressId == addr.id ? kPinkPale : Colors.white,
          ),
          child: Row(
            children: [
              _RadioDot(selected: _selectedAddressId == addr.id),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(addr.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                              color: Colors.grey.shade100, borderRadius: BorderRadius.circular(4)),
                          child: Text(addr.type,
                              style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.w500)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(addr.fullAddress, style: const TextStyle(color: Colors.grey, fontSize: 12, height: 1.4)),
                    Text('📞 ${addr.phone}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        ),
      );

  Widget _paymentTile(Map<String, Object> m) {
    final isSelected = _paymentMethod == m['id'];
    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = m['id'] as String),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? kPink : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(10),
          color: isSelected ? kPinkPale : Colors.white,
        ),
        child: Row(
          children: [
            _RadioDot(selected: isSelected),
            const SizedBox(width: 8),
            Icon(m['icon'] as IconData, color: isSelected ? kPink : Colors.grey.shade600, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(m['label'] as String,
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      color: isSelected ? kDark : Colors.grey.shade700)),
            ),
            if (m['id'] != 'COD')
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: kPinkPale, borderRadius: BorderRadius.circular(4)),
                child: const Text('Razorpay',
                    style: TextStyle(fontSize: 10, color: kPink, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value,
      {bool isBold = false, Color? valueColor, double fontSize = 13}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: TextStyle(
                fontSize: fontSize,
                fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
                color: isBold ? kDark : Colors.grey.shade700)),
        Text(value,
            style: TextStyle(
                fontSize: fontSize,
                fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
                color: valueColor ?? (isBold ? kDark : null))),
      ],
    );
  }
}

class _RadioDot extends StatelessWidget {
  final bool selected;
  const _RadioDot({required this.selected});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: selected ? kPink : Colors.grey.shade400, width: selected ? 2 : 1.5),
        color: Colors.white,
      ),
      child: selected
          ? Center(
              child: Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(shape: BoxShape.circle, color: kPink),
              ),
            )
          : null,
    );
  }
}
