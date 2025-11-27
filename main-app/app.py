from flask import Flask, jsonify, render_template, request, send_from_directory
import requests
from functools import lru_cache
import os

# PENTING: Mengatur Flask agar dapat mencari file statis/index.html di folder root proyek
# static_folder='.' membuat Flask mencari index.html di direktori kerja (/app)
app = Flask(__name__, template_folder='./templates', static_folder='.') 

# Konfigurasi Host Service
product_service_host = "localhost" if os.getenv("HOSTNAME") is None else "product-service"
cart_service_host = "localhost" if os.getenv("HOSTNAME") is None else "cart-service"
review_service_host = "localhost" if os.getenv("HOSTNAME") is None else "review-service"
# User Service host sudah secara implisit digunakan oleh frontend JS

@lru_cache(maxsize=128)
def get_products(product_id):
    try:
        response = requests.get(f'http://{product_service_host}:3000/products/{product_id}')
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching product data: {e}")
        return {"error": "Failed to fetch product data"}

def get_carts(product_id):
    try:
        response = requests.get(f'http://{cart_service_host}:3002/cart/{product_id}')
        response.raise_for_status()
        data = response.json()

        # Jika format data valid
        if 'data' in data:
            cart_item = data['data']  

            # Jika datanya berupa dict (satu item)
            if isinstance(cart_item, dict) and 'quantity' in cart_item:
                return cart_item['quantity']

        return 0

    except requests.exceptions.RequestException as e:
        print(f"Error fetching cart data: {e}")
        return 0 


def get_reviews(product_id):
    try:
        response = requests.get(f'http://{review_service_host}:3003/products/{product_id}/reviews')
        response.raise_for_status()
        data = response.json()

        return data.get('data',{
            "reviews": [], 
            "product": {}
            })
    except requests.exceptions.RequestException as e:
        print(f"Error fetching review data: {e}")
        return {"error": "Failed to fetch review data"}
    
@app.route('/products/<int:product_id>')
def get_product_info(product_id):
    product = get_products(product_id)
    cart = get_carts(product_id)
    review = get_reviews(product_id)

    combined_response = {
        "product": product if "error" not in product else None,
        "cart": cart,
        "reviews": review.get("reviews", []) if "error" not in review else []
    }

    if request.args.get('format') == 'json':
        return jsonify({
            "data": combined_response,
            "message": "Product data fetched successfully" 
        })

    return render_template(
    'product.html',
    product=product,
    cart=cart,
    reviews=review.get("reviews", [])
)

# ==========================================================
# ENDPOINT BARU UNTUK MELAYANI ANTARMUKA USER (index.html)
# ==========================================================

# 1. Endpoint utama (homepage): Memberikan panduan
@app.route('/')
def homepage():
    return jsonify({
        "message": "Main App Gateway is Running. Access /users for User Management.",
        "services": {
            "Product Info": "/products/1",
            "User Management": "/users"
        }
    })

# 2. Endpoint /users: Melayani file HTML frontend (index.html)
@app.route('/users')
def serve_user_interface():
    # send_from_directory melayani file statis (index.html) dari direktori root ('.')
    return send_from_directory('.', 'index.html')


if __name__ == '__main__':
    # Pastikan host 0.0.0.0 agar dapat diakses dari luar container (Docker)
    app.run(host="0.0.0.0",port=3005, debug=True)