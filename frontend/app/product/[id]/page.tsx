'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '../../../lib/api';
import Link from 'next/link';

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  tipologia?: string[];
  departamento?: string;
  sabores?: string;
  descripcion?: string;
  historia?: string;
  marca?: string;
};

type CartItem = Omit<Product, 'tipologia'> & {
  quantity: number;
  tipologia?: string;
};

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // 🔥 estado tipología
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/products/${id}`)
      .then(res => res.json())
      .then((data: Product) => {
        setProduct(data);

        // 🔥 si hay tipologías, seleccionar la primera por defecto
        if (data.tipologia && data.tipologia.length > 0) {
          setTipoSeleccionado(data.tipologia[0]);
        }
        
        // Cargar productos relacionados (misma marca)
        return fetch(`${API_URL}/products`)
          .then(res => res.json())
          .then((allProducts: Product[]) => {
          const related = allProducts
            .filter((p) => p._id !== id && p.marca === data.marca)
            .slice(0, 3);
          setRelatedProducts(related);
        });
      })
      .catch(() => console.log('Error cargando producto'));
  }, [id]);

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    setQuantity(isNaN(num) || num < 1 ? 1 : num);
  };

  const addToCart = () => {
    if (!product) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.email) {
      alert('Debes iniciar sesión');
      window.location.href = '/login';
      return;
    }

    const key = `cart_${user.email}`;
    const savedCart = localStorage.getItem(key);
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

    const existing = cart.find(
      (item) =>
        item._id === product._id &&
        item.tipologia === tipoSeleccionado
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        ...product,
        quantity,
        tipologia: tipoSeleccionado,
      });
    }

    localStorage.setItem(key, JSON.stringify(cart));

    alert('Producto agregado 🛒');
    window.location.href = '/';
  };

  if (!product) return <p style={{ padding: '40px', textAlign: 'center' }}>Cargando...</p>;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      
      {/* Botón volver */}
      <button 
        onClick={() => window.history.back()}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer',
          color: '#666',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        ← Volver
      </button>

      {/* Contenido principal - 2 columnas */}
      <div style={{ 
        display: 'flex', 
        gap: '50px',
        flexWrap: 'wrap',
      }}>
        
        {/* 🖼 COLUMNA IZQUIERDA - IMAGEN */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <img
            src={product.image || 'https://via.placeholder.com/400x400?text=Café'}
            alt={product.name}
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '16px',
            }}
          />
        </div>

        {/* 📄 COLUMNA DERECHA - INFORMACIÓN */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          
          {/* Nombre del producto */}
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            marginBottom: '15px',
            color: '#2c2c2c'
          }}>
            {product.name}
          </h1>

          {/* Precio */}
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '25px',
            color: '#921919'
          }}>
            ${product.price.toLocaleString()}
          </h2>

          {/* 🔥 TIPOLOGÍA (selector si hay más de 1) */}
          {product.tipologia && product.tipologia.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>Tipología:</label>
              {product.tipologia.length > 1 ? (
                <select
                  value={tipoSeleccionado}
                  onChange={(e) => setTipoSeleccionado(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    width: '200px',
                    fontSize: '14px',
                  }}
                >
                  {product.tipologia.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: '16px', color: '#333' }}>{product.tipologia[0]}</span>
              )}
            </div>
          )}

          {/* 🔢 CANTIDAD */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>Cantidad:</label>
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => handleQuantityChange(e.target.value)}
              style={{
                width: '80px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          {/* 🛒 BOTÓN */}
          <button
            onClick={addToCart}
            style={{
              padding: '12px 30px',
              background: '#921919',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#6b1111')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#921919')}
          >
            Agregar al carrito 🛒
          </button>
        </div>
      </div>

      {/* 📋 SECCIÓN DE ABAJO - Tipología, Departamento, Sabores (como en la imagen) */}
      <div style={{ 
        marginTop: '60px',
        borderTop: '1px solid #eee',
        paddingTop: '30px',
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
      }}>
        
        {/* Tipología */}
        {product.tipologia && product.tipologia.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tipología
            </h3>
            <p style={{ fontSize: '16px', color: '#333' }}>
              {product.tipologia.length > 1 ? tipoSeleccionado : product.tipologia[0]}
            </p>
          </div>
        )}
        
        {/* Departamento */}
        {product.departamento && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Departamento
            </h3>
            <p style={{ fontSize: '16px', color: '#333' }}>{product.departamento}</p>
          </div>
        )}
        
        {/* Sabores */}
        {product.sabores && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sabores
            </h3>
            <p style={{ fontSize: '16px', color: '#333' }}>{product.sabores}</p>
          </div>
        )}
      </div>

      {/* Descripción (si existe) */}
      {product.descripcion && (
        <div style={{ marginTop: '30px' }}>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '15px' }}>{product.descripcion}</p>
        </div>
      )}

      {/* Historia (si existe) */}
      {product.historia && (
        <div style={{ marginTop: '30px' }}>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '15px' }}>{product.historia}</p>
        </div>
      )}

      {/* 🔥 TAMBIÉN TE PUEDE INTERESAR */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '25px', borderLeft: '4px solid #921919', paddingLeft: '15px' }}>
            También te puede interesar
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px' 
          }}>
            {relatedProducts.map((p) => (
              <Link href={`/product/${p._id}`} key={p._id} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  border: '1px solid #eee', 
                  borderRadius: '12px', 
                  padding: '15px',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  background: '#fff',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <img 
                    src={p.image || 'https://via.placeholder.com/150x150?text=Café'} 
                    alt={p.name}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                  />
                  <h3 style={{ fontSize: '14px', color: '#2c2c2c', marginBottom: '5px' }}>{p.name}</h3>
                  <p style={{ fontWeight: 'bold', color: '#921919' }}>${p.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
