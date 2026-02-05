import { useState, useEffect, useRef } from 'react';
import { FaUpload, FaTimes, FaSave, FaCog } from 'react-icons/fa';
import { getSettings, saveSettings } from '../../services/api';
import './Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    bannerImage: '',
    storeName: 'Start Pira Net',
    storePhone: '',
    storeAddress: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings({
        bannerImage: data.bannerImage || '',
        storeName: data.storeName || 'Start Pira Net',
        storePhone: data.storePhone || '',
        storeAddress: data.storeAddress || ''
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Se não houver configurações, usa valores padrão
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveSettings(settings);
      setHasChanges(false);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings({ ...settings, bannerImage: reader.result });
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSettings({ ...settings, bannerImage: '' });
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  return (
    <div className="settings-page">
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      ) : (
        <>
          <div className="page-header">
            <h2><FaCog /> Configurações do Site</h2>
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              <FaSave /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

      <div className="settings-container">
        {/* Banner/Capa */}
        <div className="settings-section">
          <h3>Foto de Capa do Menu</h3>
          <p className="section-description">
            Imagem que aparece no topo da página do menu público, acima do campo de busca.
          </p>

          <div className="form-group">
            <label>Imagem do Banner</label>
            <div className="image-upload-container">
              <input
                type="text"
                placeholder="URL da imagem ou use o botão para fazer upload"
                value={settings.bannerImage}
                onChange={(e) => handleInputChange('bannerImage', e.target.value)}
              />
              <div className="upload-button-group">
                <button
                  type="button"
                  className="btn-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaUpload /> Escolher Arquivo
                </button>
                {settings.bannerImage && (
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={handleRemoveImage}
                  >
                    <FaTimes /> Remover
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {settings.bannerImage && (
              <div className="banner-preview">
                <label>Preview:</label>
                <div className="preview-banner-container">
                  <img 
                    src={settings.bannerImage} 
                    alt="Preview do Banner" 
                    className="preview-banner-img" 
                  />
                  <div className="preview-info">
                    <p>✅ Assim ficará no menu público</p>
                    <p>Recomendado: 1920x400px (desktop) / adapta automaticamente no mobile</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações da Loja */}
        <div className="settings-section">
          <h3>Informações da Loja</h3>
          <p className="section-description">
            Informações básicas que podem ser usadas no sistema.
          </p>

          <div className="form-group">
            <label>Nome da Loja</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleInputChange('storeName', e.target.value)}
              placeholder="Start Pira Net"
            />
          </div>

          <div className="form-group">
            <label>Telefone/WhatsApp</label>
            <input
              type="text"
              value={settings.storePhone}
              onChange={(e) => handleInputChange('storePhone', e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              value={settings.storeAddress}
              onChange={(e) => handleInputChange('storeAddress', e.target.value)}
              placeholder="Rua Example, 123 - Bairro - Cidade"
            />
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="save-reminder">
          <p>⚠️ Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default Settings;
