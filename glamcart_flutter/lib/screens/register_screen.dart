import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../main.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _error = null);
    try {
      await context.read<AuthProvider>().register(
            _nameCtrl.text.trim(),
            _emailCtrl.text.trim(),
            _passCtrl.text,
          );
      if (!mounted) return;
      await context.read<CartProvider>().fetchCart();
      if (!mounted) return;
      Navigator.pop(context);
    } catch (e) {
      setState(() {
        try {
          _error = (e as dynamic).response?.data['error'] ?? 'Registration failed. Try again.';
        } catch (_) {
          _error = 'Registration failed. Try again.';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthProvider>().loading;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(backgroundColor: Colors.white, surfaceTintColor: Colors.white),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                const Text('Create Account',
                    style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: kDark)),
                const SizedBox(height: 6),
                RichText(
                  text: const TextSpan(
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                    children: [
                      TextSpan(text: 'Join '),
                      TextSpan(text: 'GlamCart', style: TextStyle(color: kPink, fontWeight: FontWeight.bold)),
                      TextSpan(text: ' for exclusive deals and offers'),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                if (_error != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, color: Colors.red.shade600, size: 16),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_error!, style: TextStyle(color: Colors.red.shade700, fontSize: 13))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                TextFormField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.person_outline, color: Colors.grey),
                  ),
                  textCapitalization: TextCapitalization.words,
                  textInputAction: TextInputAction.next,
                  validator: (v) => v!.trim().isEmpty ? 'Please enter your name' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined, color: Colors.grey),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  validator: (v) => v!.isEmpty ? 'Please enter your email' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passCtrl,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    hintText: 'Min. 6 characters',
                    prefixIcon: const Icon(Icons.lock_outline, color: Colors.grey),
                    suffixIcon: IconButton(
                      icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: Colors.grey),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  obscureText: _obscure,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _submit(),
                  validator: (v) => v!.length < 6 ? 'Password must be at least 6 characters' : null,
                ),

                const SizedBox(height: 28),

                ElevatedButton(
                  onPressed: loading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Create Account',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),

                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Already have an account? ', style: TextStyle(color: Colors.grey)),
                    GestureDetector(
                      onTap: () => Navigator.pushReplacement(
                          context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                      child: const Text('Login',
                          style: TextStyle(color: kPink, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
