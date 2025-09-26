'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface Translation {
  [key: string]: string | Translation;
}

interface Translations {
  [language: string]: Translation;
}

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLanguages: string[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Translation data
const translations: Translations = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    retry: 'Retry',
    copy: 'Copy',
    copied: 'Copied to clipboard!',
    
    // Payment Page
    paymentTitle: 'Zignals Payment',
    paymentSubtitle: 'Complete your payment securely with PayPal',
    paymentDetails: 'Payment Details',
    customerInformation: 'Customer Information',
    completePayment: 'Complete Your Payment',
    securePayment: 'Secure Payment',
    paymentMethod: 'Payment Method',
    amount: 'Amount',
    status: 'Status',
    description: 'Description',
    date: 'Date',
    customerName: 'Customer Name',
    customerEmail: 'Email Address',
    totalAmount: 'Total Amount',
    processingFee: 'Processing Fee',
    netAmount: 'Net Amount',
    paymentId: 'Payment ID',
    created: 'Created',
    updated: 'Updated',
    advancedDetails: 'Advanced Details',
    paypalOrderId: 'PayPal Order ID',
    transactionId: 'Transaction ID',
    metadata: 'Metadata',
    device: 'Device',
    ipAddress: 'IP Address',
    
    // Payment Status
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    
    // Payment Actions
    paymentCompleted: 'Payment Completed Successfully!',
    paymentFailed: 'Payment Failed',
    paymentCancelled: 'Payment Cancelled',
    paymentExpired: 'Payment Link Expires Soon',
    timeRemaining: 'Time remaining',
    processingPayment: 'Processing Payment',
    pleaseWait: 'Please wait while we process your payment...',
    thankYou: 'Thank you for your payment. You will receive a confirmation email shortly.',
    paymentFailedMessage: 'Unfortunately, your payment could not be processed. Please try again or contact support.',
    paymentCancelledMessage: 'This payment link has been cancelled. You can create a new payment link if needed.',
    tryAgain: 'Try Again',
    returnToHome: 'Return to Home',
    copyTransactionId: 'Copy Transaction ID',
    printReceipt: 'Print Receipt',
    
    // Security
    sslSecured: 'SSL Secured',
    encrypted: 'Encrypted',
    secureConnection: 'Your connection is secure',
    securityStatus: 'Security Status',
    riskAssessment: 'Risk Assessment',
    connectionDetails: 'Connection Details',
    sessionId: 'Session ID',
    protocol: 'Protocol',
    securityNotice: 'Security Notice',
    unusualActivity: 'We\'ve detected some unusual activity. For your security, please ensure you\'re using a trusted network and device.',
    poweredBy: 'Powered by Zignals Security',
    lastUpdated: 'Last updated',
    
    // Test Page
    testPaymentGenerator: 'Test Payment Link Generator',
    testPaymentSubtitle: 'Create a test payment link to try the enhanced NCP payment page with security features',
    createPaymentLink: 'Create Payment Link',
    fillDetails: 'Fill in the details below to generate a test payment link',
    currency: 'Currency',
    paymentLinkCreated: 'Payment Link Created!',
    securePaymentLink: 'Your secure payment link is ready for testing',
    testPaymentPage: 'Test Payment Page',
    copyLink: 'Copy Link',
    securityFeatures: 'Security Features',
    enhancedSecurity: 'Enhanced security monitoring',
    sslEncryption: 'SSL Encryption',
    rateLimiting: 'Rate Limiting',
    realTimeMonitoring: 'Real-time monitoring',
    currentSession: 'Current Session',
    riskScore: 'Risk Score',
    
    // Analytics
    paymentAnalytics: 'Payment Analytics',
    overallStatistics: 'Overall Payment Statistics',
    individualAnalysis: 'Individual Payment Analysis',
    totalPayments: 'Total Payments',
    totalRevenue: 'Total Revenue',
    successRate: 'Success Rate',
    averageAmount: 'Average Amount',
    paymentStatusDistribution: 'Payment Status Distribution',
    deviceDistribution: 'Device Distribution',
    recentPayments: 'Recent Payments',
    latestTransactions: 'Latest payment transactions',
    topCountries: 'Top Countries by Revenue',
    realTimeTracker: 'Real-Time Payment Tracker',
    liveActivity: 'Live payment activity monitoring',
    livePaymentEvents: 'Live Payment Events',
    realTimeFeed: 'Real-time payment activity feed',
    noEvents: 'No events yet. Start tracking to see live activity.',
    activeUsers: 'Active Users',
    
    // Accessibility
    skipToContent: 'Skip to main content',
    closeDialog: 'Close dialog',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    showDetails: 'Show details',
    hideDetails: 'Hide details',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section',
    loadingContent: 'Loading content, please wait',
    contentLoaded: 'Content loaded successfully',
    errorOccurred: 'An error occurred',
    requiredField: 'This field is required',
    invalidInput: 'Invalid input',
    formSubmitted: 'Form submitted successfully',
    
    // ARIA Labels
    ariaPaymentForm: 'Payment form',
    ariaCustomerInfo: 'Customer information',
    ariaPaymentDetails: 'Payment details',
    ariaSecurityStatus: 'Security status',
    ariaAnalyticsChart: 'Analytics chart',
    ariaLiveRegion: 'Live payment updates',
    ariaProgressBar: 'Progress bar',
    ariaButton: 'Button',
    ariaInput: 'Input field',
    ariaSelect: 'Select dropdown',
    ariaCheckbox: 'Checkbox',
    ariaRadio: 'Radio button',
    ariaTab: 'Tab',
    ariaTabPanel: 'Tab panel',
    ariaDialog: 'Dialog',
    ariaAlert: 'Alert message',
    ariaStatus: 'Status message',
  },
  
  es: {
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    close: 'Cerrar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar',
    retry: 'Reintentar',
    copy: 'Copiar',
    copied: '¡Copiado al portapapeles!',
    
    // Payment Page
    paymentTitle: 'Pago Zignals',
    paymentSubtitle: 'Complete su pago de forma segura con PayPal',
    paymentDetails: 'Detalles del Pago',
    customerInformation: 'Información del Cliente',
    completePayment: 'Complete Su Pago',
    securePayment: 'Pago Seguro',
    paymentMethod: 'Método de Pago',
    amount: 'Cantidad',
    status: 'Estado',
    description: 'Descripción',
    date: 'Fecha',
    customerName: 'Nombre del Cliente',
    customerEmail: 'Dirección de Correo',
    totalAmount: 'Cantidad Total',
    processingFee: 'Tarifa de Procesamiento',
    netAmount: 'Cantidad Neta',
    paymentId: 'ID de Pago',
    created: 'Creado',
    updated: 'Actualizado',
    advancedDetails: 'Detalles Avanzados',
    paypalOrderId: 'ID de Pedido PayPal',
    transactionId: 'ID de Transacción',
    metadata: 'Metadatos',
    device: 'Dispositivo',
    ipAddress: 'Dirección IP',
    
    // Payment Status
    pending: 'Pendiente',
    completed: 'Completado',
    failed: 'Fallido',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
    
    // Payment Actions
    paymentCompleted: '¡Pago Completado Exitosamente!',
    paymentFailed: 'Pago Fallido',
    paymentCancelled: 'Pago Cancelado',
    paymentExpired: 'El Enlace de Pago Expira Pronto',
    timeRemaining: 'Tiempo restante',
    processingPayment: 'Procesando Pago',
    pleaseWait: 'Por favor espere mientras procesamos su pago...',
    thankYou: 'Gracias por su pago. Recibirá un correo de confirmación en breve.',
    paymentFailedMessage: 'Desafortunadamente, su pago no pudo ser procesado. Por favor intente de nuevo o contacte soporte.',
    paymentCancelledMessage: 'Este enlace de pago ha sido cancelado. Puede crear un nuevo enlace de pago si es necesario.',
    tryAgain: 'Intentar de Nuevo',
    returnToHome: 'Volver al Inicio',
    copyTransactionId: 'Copiar ID de Transacción',
    printReceipt: 'Imprimir Recibo',
    
    // Security
    sslSecured: 'SSL Seguro',
    encrypted: 'Encriptado',
    secureConnection: 'Su conexión es segura',
    securityStatus: 'Estado de Seguridad',
    riskAssessment: 'Evaluación de Riesgo',
    connectionDetails: 'Detalles de Conexión',
    sessionId: 'ID de Sesión',
    protocol: 'Protocolo',
    securityNotice: 'Aviso de Seguridad',
    unusualActivity: 'Hemos detectado alguna actividad inusual. Para su seguridad, asegúrese de usar una red y dispositivo confiables.',
    poweredBy: 'Desarrollado por Zignals Security',
    lastUpdated: 'Última actualización',
    
    // Test Page
    testPaymentGenerator: 'Generador de Enlaces de Pago de Prueba',
    testPaymentSubtitle: 'Cree un enlace de pago de prueba para probar la página de pago NCP mejorada con características de seguridad',
    createPaymentLink: 'Crear Enlace de Pago',
    fillDetails: 'Complete los detalles a continuación para generar un enlace de pago de prueba',
    currency: 'Moneda',
    paymentLinkCreated: '¡Enlace de Pago Creado!',
    securePaymentLink: 'Su enlace de pago seguro está listo para pruebas',
    testPaymentPage: 'Página de Pago de Prueba',
    copyLink: 'Copiar Enlace',
    securityFeatures: 'Características de Seguridad',
    enhancedSecurity: 'Monitoreo de seguridad mejorado',
    sslEncryption: 'Encriptación SSL',
    rateLimiting: 'Limitación de Velocidad',
    realTimeMonitoring: 'Monitoreo en tiempo real',
    currentSession: 'Sesión Actual',
    riskScore: 'Puntuación de Riesgo',
    
    // Analytics
    paymentAnalytics: 'Analíticas de Pago',
    overallStatistics: 'Estadísticas Generales de Pago',
    individualAnalysis: 'Análisis de Pago Individual',
    totalPayments: 'Total de Pagos',
    totalRevenue: 'Ingresos Totales',
    successRate: 'Tasa de Éxito',
    averageAmount: 'Cantidad Promedio',
    paymentStatusDistribution: 'Distribución del Estado del Pago',
    deviceDistribution: 'Distribución de Dispositivos',
    recentPayments: 'Pagos Recientes',
    latestTransactions: 'Últimas transacciones de pago',
    topCountries: 'Países Principales por Ingresos',
    realTimeTracker: 'Rastreador de Pagos en Tiempo Real',
    liveActivity: 'Monitoreo de actividad de pago en vivo',
    livePaymentEvents: 'Eventos de Pago en Vivo',
    realTimeFeed: 'Feed de actividad de pago en tiempo real',
    noEvents: 'Aún no hay eventos. Inicie el seguimiento para ver la actividad en vivo.',
    activeUsers: 'Usuarios Activos',
    
    // Accessibility
    skipToContent: 'Saltar al contenido principal',
    closeDialog: 'Cerrar diálogo',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    showDetails: 'Mostrar detalles',
    hideDetails: 'Ocultar detalles',
    expandSection: 'Expandir sección',
    collapseSection: 'Contraer sección',
    loadingContent: 'Cargando contenido, por favor espere',
    contentLoaded: 'Contenido cargado exitosamente',
    errorOccurred: 'Ocurrió un error',
    requiredField: 'Este campo es requerido',
    invalidInput: 'Entrada inválida',
    formSubmitted: 'Formulario enviado exitosamente',
    
    // ARIA Labels
    ariaPaymentForm: 'Formulario de pago',
    ariaCustomerInfo: 'Información del cliente',
    ariaPaymentDetails: 'Detalles del pago',
    ariaSecurityStatus: 'Estado de seguridad',
    ariaAnalyticsChart: 'Gráfico de analíticas',
    ariaLiveRegion: 'Actualizaciones de pago en vivo',
    ariaProgressBar: 'Barra de progreso',
    ariaButton: 'Botón',
    ariaInput: 'Campo de entrada',
    ariaSelect: 'Menú desplegable',
    ariaCheckbox: 'Casilla de verificación',
    ariaRadio: 'Botón de radio',
    ariaTab: 'Pestaña',
    ariaTabPanel: 'Panel de pestaña',
    ariaDialog: 'Diálogo',
    ariaAlert: 'Mensaje de alerta',
    ariaStatus: 'Mensaje de estado',
  },
  
  fr: {
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    edit: 'Modifier',
    delete: 'Supprimer',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Soumettre',
    retry: 'Réessayer',
    copy: 'Copier',
    copied: 'Copié dans le presse-papiers !',
    
    // Payment Page
    paymentTitle: 'Paiement Zignals',
    paymentSubtitle: 'Complétez votre paiement en toute sécurité avec PayPal',
    paymentDetails: 'Détails du Paiement',
    customerInformation: 'Informations Client',
    completePayment: 'Complétez Votre Paiement',
    securePayment: 'Paiement Sécurisé',
    paymentMethod: 'Méthode de Paiement',
    amount: 'Montant',
    status: 'Statut',
    description: 'Description',
    date: 'Date',
    customerName: 'Nom du Client',
    customerEmail: 'Adresse Email',
    totalAmount: 'Montant Total',
    processingFee: 'Frais de Traitement',
    netAmount: 'Montant Net',
    paymentId: 'ID de Paiement',
    created: 'Créé',
    updated: 'Mis à jour',
    advancedDetails: 'Détails Avancés',
    paypalOrderId: 'ID de Commande PayPal',
    transactionId: 'ID de Transaction',
    metadata: 'Métadonnées',
    device: 'Appareil',
    ipAddress: 'Adresse IP',
    
    // Payment Status
    pending: 'En attente',
    completed: 'Terminé',
    failed: 'Échoué',
    cancelled: 'Annulé',
    refunded: 'Remboursé',
    
    // Payment Actions
    paymentCompleted: 'Paiement Terminé avec Succès !',
    paymentFailed: 'Paiement Échoué',
    paymentCancelled: 'Paiement Annulé',
    paymentExpired: 'Le Lien de Paiement Expire Bientôt',
    timeRemaining: 'Temps restant',
    processingPayment: 'Traitement du Paiement',
    pleaseWait: 'Veuillez patienter pendant que nous traitons votre paiement...',
    thankYou: 'Merci pour votre paiement. Vous recevrez un email de confirmation sous peu.',
    paymentFailedMessage: 'Malheureusement, votre paiement n\'a pas pu être traité. Veuillez réessayer ou contacter le support.',
    paymentCancelledMessage: 'Ce lien de paiement a été annulé. Vous pouvez créer un nouveau lien de paiement si nécessaire.',
    tryAgain: 'Réessayer',
    returnToHome: 'Retour à l\'Accueil',
    copyTransactionId: 'Copier l\'ID de Transaction',
    printReceipt: 'Imprimer le Reçu',
    
    // Security
    sslSecured: 'SSL Sécurisé',
    encrypted: 'Chiffré',
    secureConnection: 'Votre connexion est sécurisée',
    securityStatus: 'Statut de Sécurité',
    riskAssessment: 'Évaluation des Risques',
    connectionDetails: 'Détails de Connexion',
    sessionId: 'ID de Session',
    protocol: 'Protocole',
    securityNotice: 'Avis de Sécurité',
    unusualActivity: 'Nous avons détecté une activité inhabituelle. Pour votre sécurité, assurez-vous d\'utiliser un réseau et un appareil de confiance.',
    poweredBy: 'Alimenté par Zignals Security',
    lastUpdated: 'Dernière mise à jour',
    
    // Test Page
    testPaymentGenerator: 'Générateur de Lien de Paiement de Test',
    testPaymentSubtitle: 'Créez un lien de paiement de test pour essayer la page de paiement NCP améliorée avec des fonctionnalités de sécurité',
    createPaymentLink: 'Créer un Lien de Paiement',
    fillDetails: 'Remplissez les détails ci-dessous pour générer un lien de paiement de test',
    currency: 'Devise',
    paymentLinkCreated: 'Lien de Paiement Créé !',
    securePaymentLink: 'Votre lien de paiement sécurisé est prêt pour les tests',
    testPaymentPage: 'Page de Paiement de Test',
    copyLink: 'Copier le Lien',
    securityFeatures: 'Fonctionnalités de Sécurité',
    enhancedSecurity: 'Surveillance de sécurité améliorée',
    sslEncryption: 'Chiffrement SSL',
    rateLimiting: 'Limitation de Débit',
    realTimeMonitoring: 'Surveillance en temps réel',
    currentSession: 'Session Actuelle',
    riskScore: 'Score de Risque',
    
    // Analytics
    paymentAnalytics: 'Analytiques de Paiement',
    overallStatistics: 'Statistiques Globales de Paiement',
    individualAnalysis: 'Analyse de Paiement Individuelle',
    totalPayments: 'Total des Paiements',
    totalRevenue: 'Revenus Totaux',
    successRate: 'Taux de Réussite',
    averageAmount: 'Montant Moyen',
    paymentStatusDistribution: 'Distribution du Statut de Paiement',
    deviceDistribution: 'Distribution des Appareils',
    recentPayments: 'Paiements Récents',
    latestTransactions: 'Dernières transactions de paiement',
    topCountries: 'Top Pays par Revenus',
    realTimeTracker: 'Suivi de Paiement en Temps Réel',
    liveActivity: 'Surveillance de l\'activité de paiement en direct',
    livePaymentEvents: 'Événements de Paiement en Direct',
    realTimeFeed: 'Flux d\'activité de paiement en temps réel',
    noEvents: 'Aucun événement pour le moment. Commencez le suivi pour voir l\'activité en direct.',
    activeUsers: 'Utilisateurs Actifs',
    
    // Accessibility
    skipToContent: 'Aller au contenu principal',
    closeDialog: 'Fermer le dialogue',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    showDetails: 'Afficher les détails',
    hideDetails: 'Masquer les détails',
    expandSection: 'Développer la section',
    collapseSection: 'Réduire la section',
    loadingContent: 'Chargement du contenu, veuillez patienter',
    contentLoaded: 'Contenu chargé avec succès',
    errorOccurred: 'Une erreur s\'est produite',
    requiredField: 'Ce champ est requis',
    invalidInput: 'Saisie invalide',
    formSubmitted: 'Formulaire soumis avec succès',
    
    // ARIA Labels
    ariaPaymentForm: 'Formulaire de paiement',
    ariaCustomerInfo: 'Informations client',
    ariaPaymentDetails: 'Détails du paiement',
    ariaSecurityStatus: 'Statut de sécurité',
    ariaAnalyticsChart: 'Graphique d\'analytiques',
    ariaLiveRegion: 'Mises à jour de paiement en direct',
    ariaProgressBar: 'Barre de progression',
    ariaButton: 'Bouton',
    ariaInput: 'Champ de saisie',
    ariaSelect: 'Menu déroulant',
    ariaCheckbox: 'Case à cocher',
    ariaRadio: 'Bouton radio',
    ariaTab: 'Onglet',
    ariaTabPanel: 'Panneau d\'onglet',
    ariaDialog: 'Dialogue',
    ariaAlert: 'Message d\'alerte',
    ariaStatus: 'Message de statut',
  }
};

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

export function useTranslationProvider() {
  const [language, setLanguage] = useState('en');
  const [availableLanguages] = useState(['en', 'es', 'fr']);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && availableLanguages.includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, [availableLanguages]);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
  }, [language]);

  return {
    language,
    setLanguage,
    t,
    availableLanguages,
  };
}

export { TranslationContext };
