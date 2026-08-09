'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  marca?: string;
  departamento?: string;
  sabores?: string;
  tipologia?: string[];
};

type CartItem = Product & {
  quantity: number;
};

type User = {
  email?: string;
};

import heroImage from '../public/Imagen1.png';
import { API_URL } from '../lib/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User>({});
  const [error, setError] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('random');

  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('');
  const [selectedMarca, setSelectedMarca] = useState<string>('');
  const [selectedSabor, setSelectedSabor] = useState<string>('');
  const [selectedTipologia, setSelectedTipologia] = useState<string>('');

  // Productos
  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setError(true));
  }, []);

  // Usuario + carrito
  useEffect(() => {
    const savedUser: User = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    setUser(savedUser);

    if (savedUser.email) {
      const savedCart = localStorage.getItem(
        `cart_${savedUser.email}`
      );

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, []);

  // Guardar carrito
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(
        `cart_${user.email}`,
        JSON.stringify(cart)
      );
    }
  }, [cart, user]);

  const getIndividualSabores = (saboresStr?: string): string[] => {
    if (!saboresStr) return [];
    return saboresStr.split(',').map(s => s.trim()).filter(s => s);
  };

  const getUniqueDepartamentos = () => {
    return [...new Set(products.map(p => p.departamento).filter(Boolean))];
  };

  const getUniqueMarcas = () => {
    return [...new Set(products.map(p => p.marca).filter(Boolean))];
  };

  const getUniqueSabores = () => {
    const allSabores: string[] = [];
    products.forEach(p => {
      if (p.sabores) {
        const saboresArray = getIndividualSabores(p.sabores);
        allSabores.push(...saboresArray);
      }
    });
    return [...new Set(allSabores)];
  };

  const getUniqueTipologias = () => {
    const allTipologias: string[] = [];
    products.forEach(p => {
      if (p.tipologia && Array.isArray(p.tipologia)) {
        allTipologias.push(...p.tipologia);
      }
    });
    return [...new Set(allTipologias)];
  };

  const departamentos = getUniqueDepartamentos();
  const marcas = getUniqueMarcas();
  const saboresList = getUniqueSabores();
  const tipologiasList = getUniqueTipologias();

  const hasSabor = (product: Product, sabor: string): boolean => {
    if (!product.sabores) return false;
    const saboresArray = getIndividualSabores(product.sabores);
    return saboresArray.includes(sabor);
  };

  const hasTipologia = (product: Product, tipologia: string): boolean => {
    if (!product.tipologia || !Array.isArray(product.tipologia)) return false;
    return product.tipologia.includes(tipologia);
  };

  const filteredProducts = [...products]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !selectedDepartamento || p.departamento === selectedDepartamento)
    .filter(p => !selectedMarca || p.marca === selectedMarca)
    .filter(p => !selectedSabor || hasSabor(p, selectedSabor))
    .filter(p => !selectedTipologia || hasTipologia(p, selectedTipologia))
    .sort((a, b) => {
      if (sortOption === 'asc') return a.price - b.price;
      if (sortOption === 'desc') return b.price - a.price;
      // La respuesta de la API ya llega en orden de creación; "random" conserva ese orden.
      if (sortOption === 'random') return 0;
      return 0;
    });

  const resetFilters = () => {
    setSearch('');
    setSortOption('random');
    setSelectedDepartamento('');
    setSelectedMarca('');
    setSelectedSabor('');
    setSelectedTipologia('');
  };

  return (
    <div style={{ 
      margin: '0',
      padding: '0',
      background: 'rgb(69, 55, 55)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      minHeight: '100vh'
    }}>
      
      <div style={{ 
        margin: '0',
        padding: '0',
        width: '100%',
        background: 'rgb(69, 55, 55)',
        lineHeight: '0',
      }}>
        
        {!imgError ? (
          <Image 
            src={heroImage}
            alt="Los 3 Pelagatos - Sabor que se baila"
            style={{
              width: '100%',
              marginTop: '-30px',
              height: 'auto',
              display: 'block',
            }}
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ 
            color: '#fff', 
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgb(69, 55, 55)'
          }}>
            <h1 style={{ fontSize: '48px', margin: 0, color: '#fff' }}>Los 3 Pelagatos</h1>
            <p style={{ fontSize: '24px', margin: '10px 0 0', color: '#fff' }}>Sabor que se baila.</p>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 30px 80px 30px' }}>
        
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Buscar café..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '320px',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #bbb',
              fontSize: '15px',
              fontFamily: 'inherit',
              background: '#fff',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          
          <div
            style={{
              width: '200px',
              position: 'relative',
              left: '350px',
              top: '50px',
              background: '#fff',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #ddd',
              height: 'fit-content',
            }}
          >
            <h3 style={{ marginBottom: '10px', fontFamily: 'inherit' }}>Filtrar por</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>Departamentos</div>
              <select
                value={selectedDepartamento}
                onChange={(e) => setSelectedDepartamento(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Todos</option>
                {departamentos.map((dep, idx) => (
                  <option key={`dep-${idx}`} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>Marca</div>
              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Todos</option>
                {marcas.map((marca, idx) => (
                  <option key={`marca-${idx}`} value={marca}>{marca}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>Sabores</div>
              <select
                value={selectedSabor}
                onChange={(e) => setSelectedSabor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Todos</option>
                {saboresList.map((sabor, idx) => (
                  <option key={`sabor-${idx}`} value={sabor}>{sabor}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>Tipología</div>
              <select
                value={selectedTipologia}
                onChange={(e) => setSelectedTipologia(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Todos</option>
                {tipologiasList.map((tipo, idx) => (
                  <option key={`tipo-${idx}`} value={tipo}>
                    {tipo === 'grano' ? '🌰 Grano' : tipo === 'molido' ? '⚡ Molido' : tipo === 'liofilizado' ? '❄️ Liofilizado' : tipo}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={resetFilters}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '8px 12px',
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'inherit',
                color: '#555',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Restablecer filtros
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#fff' }}>
                  {filteredProducts.length} productos encontrados
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontFamily: 'inherit',
                    background: '#fff',
                  }}
                >
                  <option value="asc">Precio: bajo → alto</option>
                  <option value="desc">Precio: alto → bajo</option>
                  <option value="random">Aleatorio</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: '20px' }}>
                {filteredProducts.map((p) => (
                  <div key={p._id} style={{ border: '1px solid #ccc', borderRadius: '12px', padding: '12px', background: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <img src={p.image || 'https://via.placeholder.com/300x200?text=Cafe'} alt={p.name} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                    <h3 style={{ fontSize: '16px', fontFamily: 'inherit', marginTop: '8px', color: '#921919' }}>{p.name}</h3>
                    <p style={{ fontWeight: 'bold', fontFamily: 'inherit', fontSize: '18px' }}>${p.price.toLocaleString()}</p>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
                      <button onClick={() => (window.location.href = `/product/${p._id}`)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Ver producto</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p style={{ color: 'red', fontFamily: 'inherit', textAlign: 'center' }}>Error backend</p>}
    </div>
  );
}
