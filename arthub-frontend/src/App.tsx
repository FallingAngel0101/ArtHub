import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import ArtworkDetail from "./pages/ArtworkDetail";
import Dashboard from "./pages/Dashboard";
import CreateArtwork from "./pages/CreateArtwork";
import EditArtwork from "./pages/EditArtwork";
import Profile from "./pages/Profile";
import Exhibitions from "./pages/Exhibitions";
import ExhibitionDetail from "./pages/ExhibitionDetail";
import MyPurchases from "./pages/MyPurchases";
import GalleryDashboard from "./pages/GalleryDashboard";
import CreateExhibition from "./pages/CreateExhibition";
import ExhibitionManage from "./pages/ExhibitionManage";
import ArtistRequests from "./pages/Artist.Requests";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/artwork/:id" element={<ArtworkDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
        
        {/* Публичный просмотр выставки (для всех) */}
        <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
        
        {/* Управление выставкой (только для галереи) */}
        <Route
          path="/gallery/exhibitions/:id"
          element={
            <ProtectedRoute allowedRoles={["gallery"]}>
              <ExhibitionManage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/requests"
          element={
            <ProtectedRoute allowedRoles={["artist"]}>
              <ArtistRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["artist"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute allowedRoles={["gallery"]}>
              <GalleryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exhibitions/create"
          element={
            <ProtectedRoute allowedRoles={["gallery"]}>
              <CreateExhibition />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["artist"]}>
              <EditArtwork />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute allowedRoles={["collector"]}>
              <MyPurchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute allowedRoles={["artist"]}>
              <CreateArtwork />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;