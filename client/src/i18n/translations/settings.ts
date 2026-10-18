import type { AreaTranslations } from '../types';

const settings: AreaTranslations = {
    en: {
        'settings.common.cancel': 'Cancel',
        'settings.common.save': 'Save',
        'settings.common.saving': 'Saving...',
        'settings.common.saved': 'Saved!',
        'settings.common.error': 'Error',

        'settings.navbar.logoAlt': 'DevConnect Logo',
        'settings.navbar.profileAlt': 'Profile',

        'settings.sidebar.title': 'Settings',
        'settings.sidebar.accountPreferences': 'Account Preferences',
        'settings.sidebar.accountPrivacy': 'Account Privacy',
        'settings.sidebar.visibility': 'Visibility',
        'settings.sidebar.accountManagement': 'Account Management',

        'settings.account.title': 'Account Management',
        'settings.account.subtitle': 'Manage your account settings and data',
        'settings.account.signOut': 'Sign Out',
        'settings.account.signOutDescription':
            'Sign out of your account on this device',
        'settings.account.deleteAccount': 'Delete Account',
        'settings.account.deleteAccountDescription':
            'Permanently delete your account and data',
        'settings.account.irreversible': 'This action cannot be undone',
        'settings.account.deleteWarning':
            'Your account and all associated data will be permanently deleted after 14 days.',
        'settings.account.deleteBullet.posts':
            'All your posts and comments will be removed',
        'settings.account.deleteBullet.communities':
            'Your community memberships will be cancelled',
        'settings.account.deleteBullet.hackathons':
            'Your hackathon history will be deleted',
        'settings.account.deleteBullet.subscriptions':
            'Any active subscriptions will be cancelled',
        'settings.account.typeToConfirmPrefix': 'Type',
        'settings.account.typeToConfirmSuffix': 'to confirm',
        'settings.account.signOutNotice':
            'You will be signed out of your account and redirected to the login page.',

        'settings.privacy.title': 'Privacy & Security',
        'settings.privacy.subtitle':
            'Manage your account security and privacy settings',
        'settings.privacy.email.name': 'Email Address',
        'settings.privacy.email.description': 'Manage your email preferences',
        'settings.privacy.primaryEmail': 'Primary Email',
        'settings.privacy.emailNotifications': 'Receive email notifications',
        'settings.privacy.phoneNumber': 'Phone Number',
        'settings.privacy.smsNotifications': 'Receive SMS notifications',
        'settings.privacy.passkeysIntro':
            'Passkeys provide a more secure way to sign in without passwords.',
        'settings.privacy.touchId': 'Touch ID',
        'settings.privacy.touchIdDescription':
            'Use your fingerprint to sign in',
        'settings.privacy.setup': 'Setup',
        'settings.privacy.securityKey': 'Security Key',
        'settings.privacy.securityKeyDescription':
            'Use a hardware security key',
        'settings.privacy.add': 'Add',

        'settings.profile.title': 'Profile Information',
        'settings.profile.subtitle':
            'Manage your personal details and verification',
        'settings.profile.section.nameLocation.title': 'Name & Location',
        'settings.profile.section.nameLocation.description':
            'Update your display name and location',
        'settings.profile.section.demographics.title': 'Demographics',
        'settings.profile.section.demographics.description':
            'Personal demographic information',
        'settings.profile.section.verifications.title': 'Verifications',
        'settings.profile.section.verifications.description':
            'Verify your identity and accounts',
        'settings.profile.section.editProfile.title': 'Edit Profile',
        'settings.profile.section.editProfile.description':
            'Update your profile picture and bio',
        'settings.profile.firstName': 'First Name',
        'settings.profile.lastName': 'Last Name',
        'settings.profile.nameTitle':
            'Only letters, spaces, hyphens, and apostrophes allowed',
        'settings.profile.location': 'Location',
        'settings.profile.locationPlaceholder': 'Enter your location',
        'settings.profile.age': 'Age',
        'settings.profile.agePlaceholder': 'Enter your age',
        'settings.profile.gender': 'Gender',
        'settings.profile.gender.select': '-- Select a Gender --',
        'settings.profile.gender.preferNotToSay': 'Prefer not to say',
        'settings.profile.gender.male': 'Male',
        'settings.profile.gender.female': 'Female',
        'settings.profile.gender.other': 'Other',
        'settings.profile.verifyIntro':
            'Verify your identity to build trust in the community.',
        'settings.profile.emailVerified': 'Email Verified',
        'settings.profile.noEmail': 'No email found',
        'settings.profile.github.account': 'GitHub Account',
        'settings.profile.github.connectedWithEmail':
            'Connected: {email} (@{username})',
        'settings.profile.github.connected': 'Connected: @{username}',
        'settings.profile.github.connectPrompt': 'Connect your GitHub profile',
        'settings.profile.github.connect': 'Connect',
        'settings.profile.github.visibilityTitle': 'GitHub on your profile',
        'settings.profile.github.visibilityDescription':
            'Choose whether people can see a link to your GitHub account on your profile.',
        'settings.profile.github.showOnProfile': 'Link on my profile',
        'settings.profile.github.hideFromProfile': 'Hide from my profile',
        'settings.profile.github.visibilityFailed':
            'Could not update GitHub visibility. Please try again.',
        'settings.profile.github.connecting': 'Connecting...',
        'settings.profile.github.alreadyLinked':
            'That GitHub account is already connected to another user.',
        'settings.profile.github.connectFailed':
            'Unable to connect your GitHub account. Please try again.',
        'settings.profile.github.startFailed':
            'Could not start GitHub account connection.',
        'settings.profile.github.invalidUrl':
            'Received an invalid GitHub authorization URL.',

        'settings.visibility.title': 'Visibility Settings',
        'settings.visibility.subtitle':
            'Choose who can see your profile information and manage blocked users.',
        'settings.visibility.loading': 'Loading visibility settings…',
        'settings.visibility.profile.title': 'Profile visibility',
        'settings.visibility.profile.description':
            'Choose who can view your profile details.',
        'settings.visibility.communities.title': 'Communities visibility',
        'settings.visibility.communities.description':
            'Choose who can see communities on your profile.',
        'settings.visibility.connections.title': 'Connections visibility',
        'settings.visibility.connections.description':
            'Choose who can see your connections.',
        'settings.visibility.choice.everyone.label': 'Everyone',
        'settings.visibility.choice.everyone.description':
            'Anyone using DevConnect can see this information.',
        'settings.visibility.choice.connections.label': 'Connections only',
        'settings.visibility.choice.connections.description':
            'Only people connected with you can see this.',
        'settings.visibility.choice.onlyMe.label': 'Only me',
        'settings.visibility.choice.onlyMe.description':
            'Keep this information private.',
        'settings.visibility.saving': 'Saving…',
        'settings.visibility.status.saved': 'Visibility preference saved.',
        'settings.visibility.status.blocked': '{name} was blocked.',
        'settings.visibility.status.unblocked': '{name} was unblocked.',
        'settings.visibility.error.load': 'Could not load visibility settings.',
        'settings.visibility.error.save':
            'Could not save this visibility preference.',
        'settings.visibility.error.search':
            'People search failed. Please try again.',
        'settings.visibility.error.block':
            'Could not block this user. Please try again.',
        'settings.visibility.error.unblock':
            'Could not unblock this user. Please try again.',
        'settings.visibility.blocked.title': 'Blocked users',
        'settings.visibility.blocked.description':
            'Blocking removes your connection and prevents both of you from finding each other or sending direct messages.',
        'settings.visibility.search.placeholder':
            'Search people by name or career',
        'settings.visibility.search.ariaLabel': 'Search people to block',
        'settings.visibility.search.button': 'Search',
        'settings.visibility.search.noResults':
            'No people found. Search results follow users’ visibility settings.',
        'settings.visibility.block': 'Block',
        'settings.visibility.unblock': 'Unblock',
        'settings.visibility.blocked.listTitle': 'People you blocked',
        'settings.visibility.blocked.empty': 'You have not blocked anyone.',
    },
    es: {
        'settings.common.cancel': 'Cancelar',
        'settings.common.save': 'Guardar',
        'settings.common.saving': 'Guardando...',
        'settings.common.saved': '¡Guardado!',
        'settings.common.error': 'Error',

        'settings.navbar.logoAlt': 'Logotipo de DevConnect',
        'settings.navbar.profileAlt': 'Perfil',

        'settings.sidebar.title': 'Configuración',
        'settings.sidebar.accountPreferences': 'Preferencias de la cuenta',
        'settings.sidebar.accountPrivacy': 'Privacidad de la cuenta',
        'settings.sidebar.visibility': 'Visibilidad',
        'settings.sidebar.accountManagement': 'Administración de la cuenta',

        'settings.account.title': 'Administración de la cuenta',
        'settings.account.subtitle':
            'Administra la configuración y los datos de tu cuenta',
        'settings.account.signOut': 'Cerrar sesión',
        'settings.account.signOutDescription':
            'Cierra la sesión de tu cuenta en este dispositivo',
        'settings.account.deleteAccount': 'Eliminar cuenta',
        'settings.account.deleteAccountDescription':
            'Elimina permanentemente tu cuenta y tus datos',
        'settings.account.irreversible': 'Esta acción no se puede deshacer',
        'settings.account.deleteWarning':
            'Tu cuenta y todos los datos asociados se eliminarán permanentemente después de 14 días.',
        'settings.account.deleteBullet.posts':
            'Se eliminarán todas tus publicaciones y comentarios',
        'settings.account.deleteBullet.communities':
            'Se cancelarán tus membresías en comunidades',
        'settings.account.deleteBullet.hackathons':
            'Se eliminará tu historial de hackathons',
        'settings.account.deleteBullet.subscriptions':
            'Se cancelarán todas las suscripciones activas',
        'settings.account.typeToConfirmPrefix': 'Escribe',
        'settings.account.typeToConfirmSuffix': 'para confirmar',
        'settings.account.signOutNotice':
            'Se cerrará tu sesión y serás redirigido a la página de inicio de sesión.',

        'settings.privacy.title': 'Privacidad y seguridad',
        'settings.privacy.subtitle':
            'Administra la seguridad y la configuración de privacidad de tu cuenta',
        'settings.privacy.email.name': 'Correo electrónico',
        'settings.privacy.email.description':
            'Administra tus preferencias de correo electrónico',
        'settings.privacy.primaryEmail': 'Correo electrónico principal',
        'settings.privacy.emailNotifications':
            'Recibir notificaciones por correo electrónico',
        'settings.privacy.phoneNumber': 'Número de teléfono',
        'settings.privacy.smsNotifications': 'Recibir notificaciones por SMS',
        'settings.privacy.passkeysIntro':
            'Las llaves de acceso (passkeys) ofrecen una forma más segura de iniciar sesión sin contraseñas.',
        'settings.privacy.touchId': 'Touch ID',
        'settings.privacy.touchIdDescription':
            'Usa tu huella digital para iniciar sesión',
        'settings.privacy.setup': 'Configurar',
        'settings.privacy.securityKey': 'Llave de seguridad',
        'settings.privacy.securityKeyDescription':
            'Usa una llave de seguridad física',
        'settings.privacy.add': 'Agregar',

        'settings.profile.title': 'Información del perfil',
        'settings.profile.subtitle':
            'Administra tus datos personales y tu verificación',
        'settings.profile.section.nameLocation.title': 'Nombre y ubicación',
        'settings.profile.section.nameLocation.description':
            'Actualiza tu nombre visible y tu ubicación',
        'settings.profile.section.demographics.title': 'Datos demográficos',
        'settings.profile.section.demographics.description':
            'Información demográfica personal',
        'settings.profile.section.verifications.title': 'Verificaciones',
        'settings.profile.section.verifications.description':
            'Verifica tu identidad y tus cuentas',
        'settings.profile.section.editProfile.title': 'Editar perfil',
        'settings.profile.section.editProfile.description':
            'Actualiza tu foto de perfil y tu biografía',
        'settings.profile.firstName': 'Nombre',
        'settings.profile.lastName': 'Apellido',
        'settings.profile.nameTitle':
            'Solo se permiten letras, espacios, guiones y apóstrofos',
        'settings.profile.location': 'Ubicación',
        'settings.profile.locationPlaceholder': 'Ingresa tu ubicación',
        'settings.profile.age': 'Edad',
        'settings.profile.agePlaceholder': 'Ingresa tu edad',
        'settings.profile.gender': 'Género',
        'settings.profile.gender.select': '-- Selecciona un género --',
        'settings.profile.gender.preferNotToSay': 'Prefiero no decirlo',
        'settings.profile.gender.male': 'Masculino',
        'settings.profile.gender.female': 'Femenino',
        'settings.profile.gender.other': 'Otro',
        'settings.profile.verifyIntro':
            'Verifica tu identidad para generar confianza en la comunidad.',
        'settings.profile.emailVerified': 'Correo electrónico verificado',
        'settings.profile.noEmail': 'No se encontró ningún correo electrónico',
        'settings.profile.github.account': 'Cuenta de GitHub',
        'settings.profile.github.connectedWithEmail':
            'Conectada: {email} (@{username})',
        'settings.profile.github.connected': 'Conectada: @{username}',
        'settings.profile.github.connectPrompt': 'Conecta tu perfil de GitHub',
        'settings.profile.github.connect': 'Conectar',
        'settings.profile.github.visibilityTitle': 'GitHub en tu perfil',
        'settings.profile.github.visibilityDescription':
            'Elige si otras personas pueden ver un enlace a tu cuenta de GitHub en tu perfil.',
        'settings.profile.github.showOnProfile': 'Enlazar en mi perfil',
        'settings.profile.github.hideFromProfile': 'Ocultar de mi perfil',
        'settings.profile.github.visibilityFailed':
            'No se pudo actualizar la visibilidad de GitHub. Inténtalo de nuevo.',
        'settings.profile.github.connecting': 'Conectando...',
        'settings.profile.github.alreadyLinked':
            'Esa cuenta de GitHub ya está conectada a otro usuario.',
        'settings.profile.github.connectFailed':
            'No se pudo conectar tu cuenta de GitHub. Inténtalo de nuevo.',
        'settings.profile.github.startFailed':
            'No se pudo iniciar la conexión con la cuenta de GitHub.',
        'settings.profile.github.invalidUrl':
            'Se recibió una URL de autorización de GitHub no válida.',

        'settings.visibility.title': 'Configuración de visibilidad',
        'settings.visibility.subtitle':
            'Elige quién puede ver la información de tu perfil y administra los usuarios bloqueados.',
        'settings.visibility.loading':
            'Cargando la configuración de visibilidad…',
        'settings.visibility.profile.title': 'Visibilidad del perfil',
        'settings.visibility.profile.description':
            'Elige quién puede ver los detalles de tu perfil.',
        'settings.visibility.communities.title': 'Visibilidad de comunidades',
        'settings.visibility.communities.description':
            'Elige quién puede ver las comunidades en tu perfil.',
        'settings.visibility.connections.title': 'Visibilidad de conexiones',
        'settings.visibility.connections.description':
            'Elige quién puede ver tus conexiones.',
        'settings.visibility.choice.everyone.label': 'Todos',
        'settings.visibility.choice.everyone.description':
            'Cualquier persona que use DevConnect puede ver esta información.',
        'settings.visibility.choice.connections.label': 'Solo conexiones',
        'settings.visibility.choice.connections.description':
            'Solo las personas conectadas contigo pueden ver esto.',
        'settings.visibility.choice.onlyMe.label': 'Solo yo',
        'settings.visibility.choice.onlyMe.description':
            'Mantén esta información privada.',
        'settings.visibility.saving': 'Guardando…',
        'settings.visibility.status.saved':
            'Preferencia de visibilidad guardada.',
        'settings.visibility.status.blocked': '{name} fue bloqueado.',
        'settings.visibility.status.unblocked': '{name} fue desbloqueado.',
        'settings.visibility.error.load':
            'No se pudo cargar la configuración de visibilidad.',
        'settings.visibility.error.save':
            'No se pudo guardar esta preferencia de visibilidad.',
        'settings.visibility.error.search':
            'La búsqueda de personas falló. Inténtalo de nuevo.',
        'settings.visibility.error.block':
            'No se pudo bloquear a este usuario. Inténtalo de nuevo.',
        'settings.visibility.error.unblock':
            'No se pudo desbloquear a este usuario. Inténtalo de nuevo.',
        'settings.visibility.blocked.title': 'Usuarios bloqueados',
        'settings.visibility.blocked.description':
            'Bloquear elimina tu conexión e impide que ambos puedan encontrarse o enviarse mensajes directos.',
        'settings.visibility.search.placeholder':
            'Busca personas por nombre o profesión',
        'settings.visibility.search.ariaLabel':
            'Buscar personas para bloquear',
        'settings.visibility.search.button': 'Buscar',
        'settings.visibility.search.noResults':
            'No se encontraron personas. Los resultados de búsqueda respetan la configuración de visibilidad de los usuarios.',
        'settings.visibility.block': 'Bloquear',
        'settings.visibility.unblock': 'Desbloquear',
        'settings.visibility.blocked.listTitle': 'Personas que bloqueaste',
        'settings.visibility.blocked.empty': 'No has bloqueado a nadie.',
    },
};

export default settings;
