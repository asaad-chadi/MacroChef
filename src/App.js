import React, { useState, useEffect } from 'react';
import { 
  ChefHat, LogOut, ArrowRight, User, Star, Flame, Utensils, 
  Globe, Coins, Search, Camera, Loader, Filter, Mail, Lock,
  PlusCircle, Trash2, Save, X, Menu as MenuIcon
} from 'lucide-react';

// ==========================================
// 🟢 OFFLINE DB (For Recipe Builder)
// ==========================================
const OFFLINE_DB = [
  { name: 'Beef Mince', cal: 250, pro: 26, carb: 0, fat: 17 },
  { name: 'Chicken Breast', cal: 165, pro: 31, carb: 0, fat: 3.6 },
  { name: 'Rice (White)', cal: 130, pro: 2.7, carb: 28, fat: 0.3 },
  { name: 'Cheese', cal: 403, pro: 25, carb: 1.3, fat: 33 },
  { name: 'Bread', cal: 265, pro: 9, carb: 49, fat: 3 },
  { name: 'Tomato', cal: 18, pro: 0.9, carb: 3.9, fat: 0.2 },
  { name: 'Oil', cal: 884, pro: 0, carb: 0, fat: 100 },
];

const UNIT_MULTIPLIERS = { 'g': 1, 'oz': 28.35, 'cup': 240, 'tbsp': 15 };

// ==========================================
// 🌍 TRANSLATIONS
// ==========================================
const TRANSLATIONS = {
  en: { findFood: "Find Food", owner: "Restaurant Owner", login: "Login", signup: "Sign Up", email: "Email", pass: "Password", logout: "Logout", upload: "Upload Photo", save: "Save", loading: "Loading...", no_account: "Don't have an account?", has_account: "Have an account?", create: "Create Business", nearby: "Nearby Restaurants", menu: "Menu", price: "Price", builder: "Builder", profile: "Profile" },
  fr: { findFood: "Trouver un repas", owner: "Propriétaire", login: "Connexion", signup: "Inscrire", email: "Email", pass: "Mot de passe", logout: "Déconnexion", upload: "Télécharger", save: "Enregistrer", loading: "Chargement...", no_account: "Pas de compte ?", has_account: "Déjà un compte ?", create: "Créer Entreprise", nearby: "Restaurants", menu: "Menu", price: "Prix", builder: "Créateur", profile: "Profil" },
  ar: { findFood: "ابحث عن طعام", owner: "مالك مطعم", login: "دخول", signup: "تسجيل", email: "البريد", pass: "كلمة السر", logout: "خروج", upload: "رفع صورة", save: "حفظ", loading: "جاري التحميل...", no_account: "ليس لديك حساب؟", has_account: "لديك حساب؟", create: "إنشاء نشاط", nearby: "مطاعم قريبة", menu: "القائمة", price: "السعر", builder: "بناء", profile: "ملف" }
};
const CURRENCIES = { USD: {s:'$', r:1}, EUR: {s:'€', r:0.92}, MAD: {s:'DH', r:10} };

export default function App() {
  const [view, setView] = useState('landing');
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const t = (key) => TRANSLATIONS[lang][key] || key;
  const isRTL = lang === 'ar';

  // --- 💾 LOCAL STORAGE STATE ---
  // We use functions in useState to load from localStorage only once on startup
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('mc_users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [restaurants, setRestaurants] = useState(() => {
    const saved = localStorage.getItem('mc_restaurants');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [myRestaurant, setMyRestaurant] = useState(null);

  // --- SAVE TO LOCAL STORAGE EFFECT ---
  useEffect(() => {
    localStorage.setItem('mc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mc_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  // --- AUTH HANDLERS ---
  const handleAuth = (email, pass, isSignup) => {
    if (isSignup) {
      if (users.find(u => u.email === email)) {
        alert("User already exists");
        return;
      }
      const newUser = { id: Date.now().toString(), email, pass };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      // Check if they have a restaurant (they won't yet)
      setView('owner-setup');
    } else {
      const user = users.find(u => u.email === email && u.pass === pass);
      if (user) {
        setCurrentUser(user);
        // Find their restaurant
        const myRest = restaurants.find(r => r.ownerId === user.id);
        if (myRest) {
          setMyRestaurant(myRest);
          setView('owner-dashboard');
        } else {
          setView('owner-setup');
        }
      } else {
        alert("Invalid credentials");
      }
    }
  };

  // --- RESTAURANT HANDLERS ---
  const createRestaurant = (name) => {
    const newRest = {
      id: Date.now().toString(),
      ownerId: currentUser.id,
      name: name,
      cuisine: "General",
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      description: "Welcome!",
      menu: []
    };
    setRestaurants([...restaurants, newRest]);
    setMyRestaurant(newRest);
    setView('owner-dashboard');
  };

  const updateRestaurant = (updatedRest) => {
    const updatedList = restaurants.map(r => r.id === updatedRest.id ? updatedRest : r);
    setRestaurants(updatedList);
    setMyRestaurant(updatedRest);
  };

  const convertPrice = (p) => `${CURRENCIES[currency].s}${(p * CURRENCIES[currency].r).toFixed(0)}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* --- HEADER --- */}
      <nav className="bg-white px-6 py-4 shadow-sm flex justify-between sticky top-0 z-50 items-center">
        <div className="flex items-center gap-2 font-extrabold text-xl">
          <span className="text-red-600"><ChefHat/></span> MacroChef
        </div>
        <div className="flex gap-2">
           <button onClick={() => setLang(l => l==='en'?'fr':l==='fr'?'ar':'en')} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold"><Globe size={14}/></button>
           <button onClick={() => setCurrency(c => c==='USD'?'EUR':c==='EUR'?'MAD':'USD')} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold"><Coins size={14}/></button>
           {currentUser && <button onClick={() => { setCurrentUser(null); setView('landing'); }} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">{t('logout')}</button>}
        </div>
      </nav>

      {/* --- VIEW: LANDING --- */}
      {view === 'landing' && (
        <div className="flex flex-col items-center justify-center p-6 min-h-[80vh] gap-8 animate-in fade-in">
          <div onClick={() => setView('consumer')} className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center cursor-pointer hover:border-red-500 border-2 border-transparent transition group">
             <Utensils size={50} className="mx-auto text-red-500 mb-4 group-hover:scale-110 transition"/>
             <h2 className="text-3xl font-bold mb-2">{t('findFood')}</h2>
             <p className="text-gray-400">Search {restaurants.length > 0 ? restaurants.length : '10,000+'} Restaurants</p>
          </div>
          <div onClick={() => setView('auth')} className="bg-slate-900 text-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center cursor-pointer hover:bg-black transition">
             <ChefHat size={50} className="mx-auto text-orange-400 mb-4"/>
             <h2 className="text-3xl font-bold mb-2">{t('owner')}</h2>
             <p className="text-gray-400">Login / Create Account</p>
          </div>
        </div>
      )}

      {/* --- VIEW: AUTH --- */}
      {view === 'auth' && (
        <AuthScreen t={t} onAuth={handleAuth} />
      )}

      {/* --- VIEW: OWNER SETUP --- */}
      {view === 'owner-setup' && (
         <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl">
           <h2 className="text-2xl font-bold text-center mb-4">{t('create')}</h2>
           <input className="w-full border p-4 rounded-xl mb-4" placeholder="Restaurant Name" id="restNameInput"/>
           <button onClick={() => createRestaurant(document.getElementById('restNameInput').value)} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold">Start Business</button>
         </div>
      )}

      {/* --- VIEW: OWNER DASHBOARD --- */}
      {view === 'owner-dashboard' && myRestaurant && (
        <OwnerDashboard 
          restaurant={myRestaurant} 
          t={t} 
          convertPrice={convertPrice}
          onUpdate={updateRestaurant}
          onLogout={() => { setCurrentUser(null); setView('landing'); }}
        />
      )}

      {/* --- VIEW: CONSUMER DIRECTORY --- */}
      {view === 'consumer' && (
        <ConsumerView 
          restaurants={restaurants} 
          t={t} 
          convertPrice={convertPrice}
          onBack={() => setView('landing')}
        />
      )}

    </div>
  );
}

// --- AUTH COMPONENT ---
function AuthScreen({ t, onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-6">{isLogin ? t('login') : t('signup')}</h2>
      <div className="space-y-4">
        <input className="w-full border p-3 rounded-xl" type="email" placeholder={t('email')} value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="w-full border p-3 rounded-xl" type="password" placeholder={t('pass')} value={pass} onChange={e=>setPass(e.target.value)}/>
        <button onClick={() => onAuth(email, pass, !isLogin)} className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold">{isLogin ? t('login') : t('signup')}</button>
      </div>
      <p className="text-center mt-4 text-sm text-gray-500 cursor-pointer hover:text-orange-600" onClick={()=>setIsLogin(!isLogin)}>
        {isLogin ? t('no_account') : t('has_account')}
      </p>
    </div>
  );
}

// --- OWNER DASHBOARD ---
function OwnerDashboard({ restaurant, t, convertPrice, onUpdate, onLogout }) {
  const [activeTab, setActiveTab] = useState('menu');
  const [recipeName, setRecipeName] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState([]);

  const saveDish = () => {
    if(!recipeName) return;
    let totals = {cal:0, pro:0, carb:0, fat:0};
    ingredients.forEach(i => { totals.cal += i.cal; totals.pro += i.pro; totals.carb += i.carb; totals.fat += i.fat; });
    const newMenu = [...restaurant.menu, { id: Date.now(), name: recipeName, price, category: "Mains", totals, ingredients }];
    onUpdate({ ...restaurant, menu: newMenu });
    setRecipeName(''); setIngredients([]); setActiveTab('menu');
  };

  const handleImage = () => {
    const url = prompt("Paste Image URL:", restaurant.image);
    if(url) onUpdate({...restaurant, image: url});
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <aside className="w-64 bg-slate-900 text-white p-6">
         <div className="font-bold text-xl mb-8">{restaurant.name}</div>
         <button onClick={()=>setActiveTab('menu')} className={`w-full text-left p-3 rounded mb-2 ${activeTab==='menu'?'bg-orange-600':'text-gray-400'}`}>{t('menu')}</button>
         <button onClick={()=>setActiveTab('builder')} className={`w-full text-left p-3 rounded mb-2 ${activeTab==='builder'?'bg-orange-600':'text-gray-400'}`}>{t('builder')}</button>
         <button onClick={()=>setActiveTab('profile')} className={`w-full text-left p-3 rounded mb-2 ${activeTab==='profile'?'bg-orange-600':'text-gray-400'}`}>{t('profile')}</button>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
         {activeTab === 'profile' && (
           <div className="max-w-xl">
             <h2 className="text-2xl font-bold mb-4">{t('profile')}</h2>
             <div onClick={handleImage} className="relative h-60 w-full bg-gray-100 rounded-xl overflow-hidden mb-4 border-2 border-dashed border-gray-300 cursor-pointer group">
               <img src={restaurant.image} className="w-full h-full object-cover"/>
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold">{t('upload')}</div>
             </div>
             <input className="w-full border p-3 rounded mb-2" value={restaurant.name} onChange={e=>onUpdate({...restaurant, name: e.target.value})}/>
             <input className="w-full border p-3 rounded" value={restaurant.cuisine} onChange={e=>onUpdate({...restaurant, cuisine: e.target.value})}/>
           </div>
         )}

         {activeTab === 'builder' && (
           <div className="max-w-2xl bg-white p-6 rounded-2xl shadow-sm">
             <h2 className="font-bold text-xl mb-4">{t('builder')}</h2>
             <input className="w-full border p-3 rounded mb-2" placeholder={t('name')} value={recipeName} onChange={e=>setRecipeName(e.target.value)}/>
             <input className="w-full border p-3 rounded mb-4" type="number" placeholder={t('price')} value={price} onChange={e=>setPrice(e.target.value)}/>
             
             <div className="mb-4 flex flex-wrap gap-2">
               {OFFLINE_DB.map(ing => (
                 <button key={ing.name} onClick={()=>setIngredients([...ingredients, ing])} className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-orange-100">+ {ing.name}</button>
               ))}
             </div>
             <div className="mb-6 space-y-1">
               {ingredients.map((ing, i)=><div key={i} className="text-sm flex justify-between bg-slate-50 p-2 rounded"><span>{ing.name}</span><span>{Math.round(ing.cal)} cal</span></div>)}
             </div>
             <button onClick={saveDish} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">{t('save')}</button>
           </div>
         )}

         {activeTab === 'menu' && (
           <div className="grid gap-4">
             {restaurant.menu.map(m => (
               <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between">
                 <div><h3 className="font-bold">{m.name}</h3><span className="text-xs text-orange-500 font-bold">🔥 {Math.round(m.totals.cal)} kcal</span></div>
                 <div className="font-bold bg-green-100 text-green-700 px-2 py-1 rounded h-fit">{convertPrice(m.price)}</div>
               </div>
             ))}
             {restaurant.menu.length === 0 && <p className="text-gray-400">No dishes yet.</p>}
           </div>
         )}
      </main>
    </div>
  );
}

// --- CONSUMER VIEW ---
function ConsumerView({ restaurants, t, convertPrice, onBack }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = restaurants.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  if (selected) {
    return (
      <div className="bg-white min-h-screen">
        <div className="relative h-64">
           <img src={selected.image} className="w-full h-full object-cover brightness-50"/>
           <button onClick={()=>setSelected(null)} className="absolute top-4 left-4 bg-white/20 p-2 rounded-full text-white"><X/></button>
           <h1 className="absolute bottom-6 left-6 text-white text-4xl font-bold">{selected.name}</h1>
        </div>
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          {selected.menu && selected.menu.map(item => (
            <div key={item.id} className="border p-4 rounded-xl flex justify-between items-center shadow-sm">
              <div><h4 className="font-bold text-lg">{item.name}</h4><div className="text-sm text-gray-500">🔥 {Math.round(item.totals.cal)} kcal | P: {Math.round(item.totals.pro)}g</div></div>
              <div className="font-bold text-xl">{convertPrice(item.price)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 text-gray-500 flex gap-2"><ArrowRight className="rotate-180"/> {t('nearby')}</button>
      <div className="bg-white p-3 rounded-xl shadow-sm border flex gap-2 mb-6">
        <Search className="text-gray-400"/>
        <input className="outline-none flex-1" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(res => (
          <div key={res.id} onClick={()=>setSelected(res)} className="bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-lg transition">
            <img src={res.image} className="h-48 w-full object-cover"/>
            <div className="p-4">
              <h3 className="font-bold text-xl">{res.name}</h3>
              <p className="text-gray-500 text-sm">{res.cuisine} • ⭐ {res.rating}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-gray-400 text-center col-span-full">No restaurants found. Create one!</div>}
      </div>
    </div>
  );
}