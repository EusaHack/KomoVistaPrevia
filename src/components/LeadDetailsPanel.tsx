import React, { useState } from 'react';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronsRight
} from 'lucide-react';
import type { LeadContact } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';

interface LeadDetailsPanelProps {
  contact: LeadContact;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpdateContact?: (updated: Partial<LeadContact>) => void;
}

export const LeadDetailsPanel: React.FC<LeadDetailsPanelProps> = ({
  contact,
  collapsed,
  onToggleCollapse,
  onUpdateContact
}) => {
  const [activeTab, setActiveTab] = useState<'principal' | 'estadisticas' | 'archivos'>('principal');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(contact.budget);
  const [subscriptionSelected, setSubscriptionSelected] = useState(contact.subscription || 'Elegir');

  if (collapsed) {
    return (
      <button 
        className="expand-panel-toggle-btn"
        title="Mostrar detalles de negociación"
        onClick={onToggleCollapse}
        style={{
          background: '#0d1f33',
          border: 'none',
          borderRight: '1px solid #17324c',
          color: '#7892a9',
          padding: '12px 6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ChevronsRight size={18} />
      </button>
    );
  }

  return (
    <section className={`kommo-details-panel ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="details-header">
        <div className="details-title-group">
          <button 
            className="back-chevron-btn" 
            title="Volver"
            onClick={onToggleCollapse}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="details-lead-name">{contact.personName}</span>
        </div>

        <div className="details-actions-group">
          <button className="more-dots-btn" title="Opciones">
            <MoreHorizontal size={16} />
          </button>
          <button 
            className="more-dots-btn" 
            title="Colapsar panel"
            onClick={onToggleCollapse}
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Sub Header: ID & Tags */}
      <div className="details-sub-row">
        <span className="lead-id-text">{contact.id}</span>
        <button className="add-tags-btn" title="Agregar nuevas etiquetas">
          + AGREGAR ETIQUETAS
        </button>
      </div>

      {/* Pipeline Stage Bar */}
      <div className="pipeline-stage-selector">
        <div className="pipeline-stage-title-wrap">
          <span className="pipeline-stage-title">{contact.pipelineStage}</span>
          <span className="stage-days">({contact.stageDays} días)</span>
          <ChevronDown size={14} color="#7892a9" />
        </div>

        {/* 5-step pipeline progress bar with yellow highlight */}
        <div className="pipeline-bar">
          <div className="pipeline-step completed"></div>
          <div className="pipeline-step active"></div>
          <div className="pipeline-step"></div>
          <div className="pipeline-step"></div>
          <div className="pipeline-step"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="details-tabs-bar">
        <button 
          className={`tab-btn ${activeTab === 'principal' ? 'active' : ''}`}
          onClick={() => setActiveTab('principal')}
        >
          Principal
        </button>
        <button 
          className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setActiveTab('estadisticas')}
        >
          Estadísticas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'archivos' ? 'active' : ''}`}
          onClick={() => setActiveTab('archivos')}
        >
          Archivos
        </button>
        <button className="tab-btn" title="Más pestañas">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Tab Body: Principal */}
      {activeTab === 'principal' && (
        <div className="details-fields-list">
          {/* Usuario Responsable */}
          <div className="field-row">
            <span className="field-label">Usuario resp.</span>
            <span className="field-value">{contact.assignedUser}</span>
          </div>

          {/* Presupuesto */}
          <div className="field-row">
            <span className="field-label">Presupuesto</span>
            {isEditingBudget ? (
              <input 
                type="text" 
                value={budgetValue}
                autoFocus
                onChange={(e) => setBudgetValue(e.target.value)}
                onBlur={() => {
                  setIsEditingBudget(false);
                  onUpdateContact?.({ budget: budgetValue });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingBudget(false);
                    onUpdateContact?.({ budget: budgetValue });
                  }
                }}
                style={{
                  background: '#15314d',
                  border: '1px solid #255a8c',
                  color: '#ffffff',
                  fontSize: '13px',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  textAlign: 'right',
                  width: '90px'
                }}
              />
            ) : (
              <span 
                className="field-value" 
                title="Haz clic para editar presupuesto"
                onClick={() => setIsEditingBudget(true)}
                style={{ cursor: 'pointer' }}
              >
                {budgetValue}
              </span>
            )}
          </div>

          {/* Embedded Contact Profile Box */}
          <div className="contact-summary-card">
            <div className="contact-card-top">
              <img 
                src={contact.avatarUrl} 
                alt={contact.name} 
                className="contact-card-avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34"><rect width="34" height="34" fill="%231b3552"/><text x="50%" y="55%" fill="%23ffffff" font-size="14" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">E</text></svg>';
                }}
              />
              <div className="contact-card-info">
                <div className="contact-card-name-row">
                  <span className="contact-card-name">{contact.name}</span>
                  <MoreHorizontal size={14} color="#7892a9" style={{ cursor: 'pointer' }} />
                </div>
                <div>
                  <div className="whatsapp-business-pill">
                    <WhatsAppIcon size={12} color="#25D366" />
                    <span>WhatsApp Business</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compañía */}
          <div className="field-row">
            <span className="field-label">Compañía</span>
            <span className="field-value empty">{contact.company || '...'}</span>
          </div>

          {/* Teléfono oficina */}
          <div className="field-row">
            <span className="field-label">Teléfono ofi...+</span>
            <a 
              href={`tel:${contact.phone}`} 
              className="field-value link"
              title="Llamar o iniciar conversación"
            >
              {contact.phone}
            </a>
          </div>

          {/* Correo */}
          <div className="field-row">
            <span className="field-label">Correo</span>
            <span className="field-value empty">{contact.email || '...'}</span>
          </div>

          {/* Fecha de nacimiento */}
          <div className="field-row">
            <span className="field-label">F. nacimiento</span>
            <span className="field-value" style={{ color: contact.birthDate ? '#38bdf8' : '#7892a9' }}>
              {contact.birthDate || '...'}
            </span>
          </div>

          {/* Suscripción de */}
          <div className="field-row">
            <span className="field-label">Suscripción de</span>
            <button 
              className="choose-btn"
              onClick={() => {
                const next = subscriptionSelected === 'Elegir' ? 'Activa (Plan Pro)' : 'Elegir';
                setSubscriptionSelected(next);
              }}
            >
              {subscriptionSelected}
            </button>
          </div>

          {/* Cargo */}
          <div className="field-row">
            <span className="field-label">Cargo</span>
            <span className="field-value empty">{contact.role || '...'}</span>
          </div>
        </div>
      )}

      {/* Tab Body: Estadísticas */}
      {activeTab === 'estadisticas' && (
        <div style={{ padding: '20px 16px', color: '#7892a9', fontSize: '13px' }}>
          <p>Tiempo en negociación: <strong>26 días</strong></p>
          <p style={{ marginTop: '10px' }}>Interacciones totales: <strong>14 mensajes</strong></p>
          <p style={{ marginTop: '10px' }}>Tasa de respuesta bot: <strong>100%</strong></p>
        </div>
      )}

      {/* Tab Body: Archivos */}
      {activeTab === 'archivos' && (
        <div style={{ padding: '20px 16px', color: '#7892a9', fontSize: '13px' }}>
          <p>No hay archivos adjuntos en este lead.</p>
        </div>
      )}
    </section>
  );
};
