import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { SettingsProvider } from './settings';
import { ToastProvider, ConfirmationProvider } from './components/notifications';
import Layout from './components/Layout';
import Connexion from './pages/Connexion';
import Dashboard from './pages/Dashboard';
import Equipements from './pages/Equipements';
import EquipementDetail from './pages/EquipementDetail';
import Affectations from './pages/Affectations';
import Tickets from './pages/Tickets';
import Agents from './pages/Agents';
import Inventaires from './pages/Inventaires';
import Formations from './pages/Formations';
import Parametres from './pages/Parametres';
import Directions from './pages/Directions';
import Services from './pages/Services';
import Sites from './pages/Sites';
import Batiments from './pages/Batiments';
import Localisations from './pages/Localisations';
import Categories from './pages/Categories';
import Marques from './pages/Marques';
import Modeles from './pages/Modeles';
import Fournisseurs from './pages/Fournisseurs';
import Achats from './pages/Achats';
import Maintenances from './pages/Maintenances';
import Logiciels from './pages/Logiciels';
import Profil from './pages/Profil';
import { Spinner } from './components/ui';

function Protected({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><Spinner /></div>;
    if (! user) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
    return children;
}

function PublicOnly({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><Spinner /></div>;
    if (user) return <Navigate to="/" replace />;
    return children;
}

// Page en arrière-plan : les navigateurs gèlent les animations CSS/JS (le contenu
// resterait à opacity: 0 avec le mode `both`). On désactive les entrées animées
// tant que la page n'est pas visible, pour un rendu toujours correct.
const majVisibilite = () => document.documentElement.classList.toggle('page-cachee', document.hidden);
majVisibilite();
document.addEventListener('visibilitychange', majVisibilite);

// Fenêtre occluse : certains environnements gèlent requestAnimationFrame et les
// animations CSS alors que la page se croit visible — le contenu resterait à
// opacity: 0. Si aucun frame n'est rendu juste après le chargement, on désactive
// aussi les animations d'entrée (rendu immédiat, interactions conservées).
(() => {
    let frames = 0;
    const boucle = () => { frames += 1; requestAnimationFrame(boucle); };
    requestAnimationFrame(boucle);
    setTimeout(() => { if (frames < 2) document.documentElement.classList.add('page-cachee'); }, 800);
})();

createRoot(document.getElementById('app')).render(
    <SettingsProvider>
    <AuthProvider>
    <ToastProvider>
    <ConfirmationProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/connexion" element={<PublicOnly><Connexion /></PublicOnly>} />
                <Route element={<Protected><Layout /></Protected>}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/equipements" element={<Equipements />} />
                    <Route path="/equipements/:id" element={<EquipementDetail />} />
                    <Route path="/affectations" element={<Affectations />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/inventaires" element={<Inventaires />} />
                    <Route path="/formations" element={<Formations />} />
                    <Route path="/parametres" element={<Parametres />} />
                    <Route path="/directions" element={<Directions />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/sites" element={<Sites />} />
                    <Route path="/batiments" element={<Batiments />} />
                    <Route path="/localisations" element={<Localisations />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/marques" element={<Marques />} />
                    <Route path="/modeles" element={<Modeles />} />
                    <Route path="/fournisseurs" element={<Fournisseurs />} />
                    <Route path="/achats" element={<Achats />} />
                    <Route path="/maintenances" element={<Maintenances />} />
                    <Route path="/logiciels" element={<Logiciels />} />
                    <Route path="/profil" element={<Profil />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    </ConfirmationProvider>
    </ToastProvider>
    </AuthProvider>
    </SettingsProvider>,
);
