const ca = {
  plugin: {
    name: "Navigation UI",
    section: {
      name: "Plugin de navigation",
      item: "Configuration",
    },
  },
  header: {
    title: "Navigation",
    description: "Définissez la navigation de votre portail",
    meta: "ID: { id }, slug: { key }",
    action: {
      newItem: "Nouvel élément",
      manage: "Gérer",
      collapseAll: "Tout réduire",
      expandAll: "Tout développer",
    },
  },
  submit: {
    cta: {
      cancel: "Annuler",
      save: "Enregistrer",
    },
  },
  empty: {
    description: "Votre navigation est vide",
    cta: "Créer le premier élément",
  },
  popup: {
    navigation: {
      manage: {
        header: {
          LIST: "Toutes les navigations",
          CREATE: "Nouvelle navigation",
          DELETE: "Suppression",
          ERROR: "Erreur",
          EDIT: "Édition de \"{name}\"",
        },
        button: {
          cancel: "Annuler",
          delete: "Supprimer",
          save: "Enregistrer",
          edit: "Modifier",
          create: "Créer",
          goBack: "Retourner",
          purge: "Effacer le cache de lecture",
        },
        table: {
          id: "Id",
          name: "Nom",
          locale: "Versions locales",
          visibility: "Visibilité",
          hasSelected: "{count} entrées sélectionnées",
        },
        footer: {
          button: {
            purge: "Effacer",
          },
        },
        purge: {
          header: "Cette action effacera le cache de lecture de l'API. Cela entraînera un ralentissement temporaire des lectures pour les navigations ci-dessous.",
        },
        delete: {
          header: "Les navigations suivantes seront supprimées :",
        },
        error: {
          header: "Une erreur est survenue :(",
          message: "Une erreur est survenue lors du traitement de la demande.",
        },
        navigation: {
          visible: "visible",
          hidden: "caché",
        },
      },
      form: {
        name: {
          label: "Nom",
          placeholder: "Nom de la navigation",
          validation: {
            name: {
              required: "Le nom est requis",
              tooShort: "Le nom est trop court",
              alreadyUsed: "Le nom est déjà utilisé",
            },
            visible: {
              required: "La visibilité est requise",
            },
          },
        },
        visible: {
          label: "Visibilité",
        },
      },
    },
    item: {
      header: {
        view: "Voir l'élément de navigation",
        edit: "Modifier l'élément de navigation",
        new: "Nouvel élément de navigation",
      },
      form: {
        title: {
          label: "Titre",
          autoSync: {
            label: "Lire les champs de la relation",
          },
          placeholder: "Entrez le titre de l'élément ou laissez vide pour tirer de l'entité liée",
        },
        uiRouterKey: {
          label: "Clé du routeur UI",
          placeholder: "Si vide, généré automatiquement par \"Titre\"",
        },
        path: {
          label: "URL",
          placeholder: "Partie unique de l'URL identifiant cet élément",
          preview: "Aperçu :",
        },
        externalPath: {
          label: "URL externe",
          placeholder: "Lien vers la source externe",
          validation: {
            type: "Cette valeur n'est pas une URL valide.",
          },
        },
        menuAttached: {
          label: "Attacher au menu",
        },
        type: {
          label: "Type d'élément de navigation",
          internal: {
            label: "Source interne",
          },
          external: {
            label: "Source externe",
            description: "Chemin de sortie : {value}",
          },
          wrapper: {
            label: "Élément wrapper",
          },
        },
        audience: {
          label: "Audience",
          placeholder: "Sélectionner l'audience...",
          empty: "Il n'y a plus d'audiences",
        },
        relatedSection: {
          label: "Relation à",
        },
        relatedType: {
          label: "Type de contenu",
          placeholder: "Sélectionner le type de contenu...",
          empty: "Il n'y a pas de types de contenu à sélectionner",
        },
        related: {
          label: "Entité",
          placeholder: "Sélectionner l'entité...",
          empty: "Il n'y a plus d'entités de \"{ contentTypeName }\" à sélectionner",
        },
        i18n: {
          locale: {
            label: "Copier les détails de",
            placeholder: "locale",
            button: "Copier",
            error: {
              generic: "Impossible de copier l'élément",
              unavailable: "Version locale indisponible",
            },
          },
        },
        button: {
          create: "Créer l'élément",
          update: "Mettre à jour l'élément",
          restore: "Restaurer l'élément",
          remove: "Supprimer",
          save: "Enregistrer",
          cancel: "Annuler",
        },
      },
    },
  },
  notification: {
    navigation: {
      submit: "Les modifications de navigation ont été enregistrées",
      error: "Chemin en double : \"{ path }\" dans le parent : \"{ parentTitle }\" pour { errorTitles } éléments",
      item: {
        relation: "La relation de l'entité n'existe pas !",
        status: {
          draft: "brouillon",
          published: "publié",
        },
      },
    },
    error: {
      common: "Erreur lors du traitement de la demande.",
      customField: {
        type: "Type de champ personnalisé non pris en charge",
        media: {
          missing: "Le composant d'entrée média est manquant",
        },
      },
      item: {
        relation: "Les relations fournies dans certains éléments sont incorrectes",
        slug: "Impossible de créer une clé de routeur UI valide (slug) à partir de \"{ query }\". \"{ result }\" reçu",
      },
    }
  },
  pages: {
    auth: {
      noAccess: "Pas d'accès",
      not: {
        allowed: "Oups ! Il semble que vous n'ayez pas accès à cette page...",
      },
    },
    main: {
      search: {
        placeholder: "Tapez pour commencer à rechercher...",
        subLabel: "appuyez sur ENTRÉE pour mettre en surbrillance l'élément suivant",
      },
      header: {
        localization: {
          select: {
            placeholder: "Sélectionner la locale",
          },
        },
      },
    },
    settings: {
      title: "Paramètres de navigation",
      general: {
        title: "Paramètres généraux",
      },
      additional: {
        title: "Paramètres supplémentaires",
      },
      customFields: {
        title: "Paramètres des champs personnalisés",
      },
      nameField: {
        title: "Paramètres des types de contenu",
      },
      restoring: {
        title: "Restauration",
      },
      section: {
        title: "Plugin de navigation",
        subtitle: "Configuration",
      },
      header: {
        title: "Navigation",
        description: "Configurer le plugin de navigation",
      },
      form: {
        cascadeMenuAttached: {
          label: "Cascade du menu attaché",
          hint: "Désactiver si vous ne voulez pas que \"Menu attaché\" se propage aux éléments enfants",
        },
        preferCustomContentTypes: {
          label: "Préférer les types de contenu personnalisés",
          hint: "Préférer utiliser uniquement les types de contenu préfixés par api::",
        },
        contentTypes: {
          label: "Activer la navigation pour",
          placeholder: "ex. Pages, Articles",
          hint: "Si aucun n'est sélectionné, aucun des types de contenu n'est activé",
        },
        i18n: {
          label: "i18n",
          hint: "Activer l'internationalisation",
          hintMissingDefaultLocale: "Locale par défaut manquante !",
        },
        allowedLevels: {
          label: "Niveaux autorisés",
          placeholder: "ex. 2",
          hint: "Niveau maximum pour lequel vous pouvez marquer un élément comme \"Menu attaché\"",
        },
        audience: {
          label: "Audience",
          hint: "Activer le champ audience",
        },
        nameField: {
          default: "Par défaut",
          label: "Champs de nom",
          placeholder: "Sélectionner au moins un ou laisser vide pour appliquer les valeurs par défaut",
          hint: "Si laissé vide, le champ de nom prendra les champs suivants par ordre : \"titre\", \"sujet\" et \"nom\"",
          empty: "Ce type de contenu n'a pas d'attributs de chaîne",
        },
        populate: {
          label: "Champs à remplir",
          placeholder: "Sélectionner au moins un ou laisser vide pour désactiver le remplissage des champs de relation",
          hint: "Les champs de relation sélectionnés seront remplis dans les réponses de l'API",
          empty: "Ce type de contenu n'a pas de champs de relation",
        },
        pathDefaultFields: {
          label: "Champs par défaut du chemin",
          placeholder: "Sélectionner au moins un ou laisser vide pour désactiver le remplissage du champ de chemin avec la valeur des attributs",
          hint: "La valeur de l'attribut sélectionné sera la valeur par défaut pour le chemin interne",
          empty: "Ce type de contenu n'a pas d'attributs appropriés",
        },
        contentTypesSettings: {
          label: "Types de contenu",
          tooltip: "Configuration personnalisée par type de contenu",
          initializationWarning: {
            title: "Avertissement",
            content: "- Le type de contenu n'a pas encore été initialisé. Initialisez-le d'abord pour pouvoir l'utiliser dans un éditeur visuel.",
          },
        },
        customFields: {
          table: {
            confirmation: {
              header: "Suppression du champ personnalisé",
              message: "Cette action entraînera la suppression de toutes les valeurs des champs personnalisés des éléments de navigation.",
              confirm: "Continuer",
              error: "Une erreur est survenue lors de la suppression du champ personnalisé",
            },
            header: {
              name: "Nom",
              label: "Étiquette",
              type: "Type",
              required: "Requis",
            },
            footer: "Créer un nouveau champ personnalisé",
            edit: "Modifier le champ personnalisé",
            enable: "Activer le champ personnalisé",
            disable: "Désactiver le champ personnalisé",
            remove: "Supprimer le champ personnalisé",
            required: "requis",
            notRequired: "non requis",
          },
          popup: {
            header: {
              edit: "Modifier le champ personnalisé",
              new: "Ajouter un nouveau champ personnalisé",
            },
            name: {
              label: "Nom du champ personnalisé",
              placeholder: "exemple_nom",
              description: "Le nom du champ personnalisé doit être unique",
            },
            label: {
              label: "Étiquette du champ personnalisé",
              placeholder: "Exemple d'étiquette",
              description: "Cette étiquette sera affichée sur le formulaire de l'élément de navigation",
            },
            type: {
              label: "Type de champ personnalisé",
            },
            required: {
              label: "Champ requis",
              description: "Activer ce champ ne changera pas les éléments de navigation déjà existants",
            },
            options: {
              label: "Options pour l'entrée de sélection",
              description: "Activer ce champ ne changera pas les éléments de navigation déjà existants",
            },
            multi: {
              label: "Activer l'entrée de plusieurs options",
            },
          },
        },
      },
      actions: {
        submit: "Enregistrer la configuration",
        restore: {
          label: "Restaurer la configuration",
          confirmation: {
            header: "Voulez-vous continuer ?",
            confirm: "Restaurer",
            description: "La configuration du plugin sera restaurée à partir du fichier plugins.js.",
          },
          description: "La restauration de la configuration du plugin entraînera son remplacement par la configuration enregistrée dans le fichier 'plugins.js'.",
        },
        restart: {
          label: "Redémarrer Strapi",
          alert: {
            title: "Strapi nécessite un redémarrage",
            description: "Vous avez apporté des modifications à la configuration qui nécessitent le redémarrage de votre application Strapi pour prendre effet. Faites-le manuellement ou en utilisant le déclencheur ci-dessous.",
            close: "Ignorer",
            cancel: "Annuler",
            reason: {
              I18N: "Les modifications de l'internationalisation (i18n) seront appliquées.",
              GRAPH_QL: "Les modifications de GraphQL seront appliquées.",
              I18N_NAVIGATIONS_PRUNE: "Les navigations de locale obsolètes seront supprimées.",
            },
          },
        },
        disableI18n: {
          confirmation: {
            header: "Désactivation de l'internationalisation",
            confirm: "Je comprends",
            description: {
              line1: "Vous désactivez l'internationalisation pour la navigation. Les navigations pour les locales différentes de la locale par défaut ne sont pas disponibles pour la visualisation et les modifications via ce plugin.",
              line2: "Vous pouvez choisir de supprimer les navigations pour d'autres locales.",
              line3: "Rappelez-vous ! La suppression est irréversible",
            },
          },
          prune: {
            label: "Navigations obsolètes",
            on: "Supprimer",
            off: "Garder",
          },
        },
      },
      notification: {
        fetch: {
          error: "Échec de la récupération de la configuration. Nouvelle tentative...",
        },
        submit: {
          success: "La configuration a été mise à jour avec succès",
          error: "La mise à jour de la configuration a échoué",
        },
        restore: {
          success: "La configuration a été restaurée avec succès",
          error: "La restauration de la configuration a échoué",
        },
        restart: {
          success: "L'application a été redémarrée avec succès",
          error: "Échec du redémarrage de votre application. Essayez de le faire manuellement.",
        },
      },
    },
    view: {
      actions: {
        i18nCopyItems: {
          confirmation: {
            header: "Confirmation",
            confirm: "Copier",
            content: "Voulez-vous copier les éléments de navigation ?",
          },
        },
      },
    },
  },
  components: {
    navigationItem: {
      action: {
        newItem: "Ajouter un élément imbriqué",
        edit: "Modifier",
        view: "Voir",
        restore: "Restaurer",
        remove: "Supprimer",
      },
      badge: {
        removed: "Supprimé",
        draft: "Brouillon",
        published: "Publié",
      },
      related: {
        localeMissing: "(Falta la versió local)"
      },
    },
    confirmation: {
      dialog: {
        button: {
          cancel: "Annuler",
          confirm: "Confirmer",
        },
        description: "Voulez-vous continuer ?",
        header: "Confirmation",
      },
    },
    notAccessPage: {
      back: "Retour à la page d'accueil",
    },
  },
  view: {
    i18n: {
      fill: {
        option: "locale {locale}",
        cta: {
          header: "ou démarrer",
          button: "copier",
        },
      },
    },
  },
};

export default ca;
