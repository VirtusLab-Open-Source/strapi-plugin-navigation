const de = {
  plugin: {
    name: 'UI-Navigation',
    section: {
      name: 'Navigation-Plugin',
      item: 'Konfiguration',
    },
  },
  header: {
    title: 'Navigation',
    description: 'Definieren Sie die Navigation Ihres Portals',
    meta: 'ID: { id }, Slug: { key }',
    action: {
      newItem: 'Neuer Eintrag',
      manage: 'Verwalten',
      collapseAll: 'Alle einklappen',
      expandAll: 'Alle ausklappen',
    },
  },
  submit: {
    cta: {
      cancel: 'Abbrechen',
      save: 'Speichern',
      cache: {
        purge: 'Cache leeren',
      },
    },
  },
  empty: {
    description: 'Ihre Navigation ist leer',
    cta: 'Ersten Eintrag erstellen',
  },
  popup: {
    navigation: {
      manage: {
        header: {
          LIST: 'Alle Navigationen',
          CREATE: 'Neue Navigation',
          DELETE: 'Löschen',
          ERROR: 'Fehler',
          EDIT: '"{name}" bearbeiten',
        },
        button: {
          cancel: 'Abbrechen',
          delete: 'Löschen',
          save: 'Speichern',
          edit: 'Bearbeiten',
          create: 'Erstellen',
          goBack: 'Zurück',
          purge: 'Lese-Cache leeren',
        },
        table: {
          id: 'ID',
          name: 'Name',
          locale: 'Sprachversionen',
          visibility: 'Sichtbarkeit',
          hasSelected: '{count} Einträge ausgewählt',
        },
        footer: {
          button: {
            purge: 'Leeren',
          },
        },
        purge: {
          header:
            'Diese Aktion leert den API-Lese-Cache. Dadurch können die untenstehenden Navigationen kurzzeitig langsamer gelesen werden.',
        },
        delete: {
          header: 'Die folgenden Navigationen werden entfernt:',
        },
        error: {
          header: 'Ein Fehler ist aufgetreten :(',
          message: 'Beim Verarbeiten der Anfrage ist ein Fehler aufgetreten.',
        },
        navigation: {
          visible: 'sichtbar',
          hidden: 'ausgeblendet',
        },
      },
      form: {
        name: {
          label: 'Name',
          placeholder: 'Name der Navigation',
          validation: {
            name: {
              required: 'Name ist erforderlich',
              tooShort: 'Name ist zu kurz',
              alreadyUsed: 'Name wird bereits verwendet',
            },
            visible: {
              required: 'Sichtbarkeit ist erforderlich',
            },
          },
        },
        visible: {
          label: 'Sichtbarkeit',
          toggle: {
            visible: 'Sichtbar',
            hidden: 'Ausgeblendet',
          },
        },
      },
    },
    item: {
      header: {
        view: 'Navigationseintrag ansehen',
        edit: 'Navigationseintrag bearbeiten',
        new: 'Neuer Navigationseintrag',
      },
      form: {
        title: {
          label: 'Titel',
          autoSync: {
            label: 'Felder aus verknüpftem Inhalt übernehmen',
          },
          placeholder:
            'Titel des Eintrags eingeben oder leer lassen, um ihn aus dem verknüpften Inhalt zu übernehmen',
        },
        uiRouterKey: {
          label: 'UI-Router-Schlüssel',
          placeholder: 'Wenn leer, automatisch aus "Titel" generiert',
        },
        uiRouter: {
          unableToRender:
            'Slug und/oder UI-Router-Schlüssel können wegen nicht unterstützter Zeichen nicht erstellt werden',
        },
        path: {
          label: 'URL',
          placeholder: 'Eindeutiger URL-Teil für diesen Eintrag',
          preview: 'Vorschau:',
        },
        externalPath: {
          label: 'Externe URL',
          placeholder: 'Link zu einer externen Quelle',
          validation: {
            type: 'Dieser Wert ist keine gültige URL.',
          },
        },
        menuAttached: {
          label: 'Im Menü anzeigen',
          value: {
            yes: 'Ja',
            no: 'Nein',
          },
        },
        type: {
          label: 'Typ des Navigationseintrags',
          internal: {
            label: 'Interne Quelle',
            source: 'URL basiert auf: {value}',
          },
          external: {
            label: 'Externe Quelle',
            description: 'Ausgabepfad: {value}',
          },
          wrapper: {
            label: 'Wrapper-Element',
          },
        },
        audience: {
          label: 'Zielgruppe',
          placeholder: 'Zielgruppe auswählen...',
          empty: 'Es sind keine weiteren Zielgruppen vorhanden',
        },
        relatedSection: {
          label: 'Verknüpfung mit',
        },
        relatedType: {
          label: 'Content-Type',
          placeholder: 'Content-Type auswählen...',
          empty: 'Es sind keine Content-Types auswählbar',
        },
        related: {
          label: 'Eintrag',
          placeholder: 'Eintrag auswählen...',
          empty: 'Es sind keine weiteren Einträge von "{ contentTypeName }" auswählbar',
        },
        i18n: {
          locale: {
            label: 'Details kopieren von',
            placeholder: 'Sprache',
            button: 'Kopieren',
            error: {
              generic: 'Eintrag konnte nicht kopiert werden',
              unavailable: 'Sprachversion nicht verfügbar',
            },
          },
        },
        button: {
          create: 'Eintrag erstellen',
          update: 'Eintrag aktualisieren',
          restore: 'Eintrag wiederherstellen',
          remove: 'Entfernen',
          save: 'Speichern',
          cancel: 'Abbrechen',
        },
      },
    },
  },
  notification: {
    navigation: {
      submit: 'Navigationsänderungen wurden gespeichert',
      error:
        'Doppelter Pfad: "{ path }" im übergeordneten Eintrag "{ parentTitle }" für { errorTitles } Einträge',
      item: {
        relation: 'Verknüpfte Entität existiert nicht!',
        status: {
          draft: 'Entwurf',
          published: 'Veröffentlicht',
        },
      },
      update: {
        error: 'Navigation konnte nicht gespeichert werden. Prüfen Sie die Entwicklerwerkzeuge.',
      },
    },
    error: {
      common: 'Fehler beim Verarbeiten der Anfrage.',
      customField: {
        type: 'Nicht unterstützter Typ für benutzerdefiniertes Feld',
        media: {
          missing: 'Media-Eingabekomponente fehlt',
        },
      },
      item: {
        relation: 'Verknüpfungen in einigen Einträgen sind fehlerhaft',
        slug: 'Aus "{ query }" konnte kein gültiger UI-Router-Schlüssel (Slug) erstellt werden. "{ result }" wurde erzeugt',
      },
    },
  },
  pages: {
    auth: {
      noAccess: 'Kein Zugriff',
      not: {
        allowed: 'Sie haben offenbar keinen Zugriff auf diese Seite...',
      },
    },
    main: {
      search: {
        placeholder: 'Tippen, um die Suche zu starten...',
        subLabel: 'ENTER drücken, um den nächsten Eintrag hervorzuheben',
      },
      header: {
        localization: {
          select: {
            placeholder: 'Sprache auswählen',
          },
        },
      },
    },
    settings: {
      title: 'Navigationseinstellungen',
      general: {
        title: 'Allgemeine Einstellungen',
      },
      additional: {
        title: 'Zusätzliche Einstellungen',
      },
      customFields: {
        title: 'Einstellungen für benutzerdefinierte Felder',
      },
      nameField: {
        title: 'Content-Type-Einstellungen',
      },
      restoring: {
        title: 'Wiederherstellung',
      },
      section: {
        title: 'Navigation-Plugin',
        subtitle: 'Konfiguration',
      },
      header: {
        title: 'Navigation',
        description: 'Navigation-Plugin konfigurieren',
      },
      form: {
        cascadeMenuAttached: {
          label: 'Menüzuordnung vererben',
          hint: 'Deaktivieren, wenn "Im Menü anzeigen" nicht an untergeordnete Einträge vererbt werden soll',
        },
        preferCustomContentTypes: {
          label: 'API-Content-Types bevorzugen',
          hint: 'Nur Content-Types mit api::-Präfix bevorzugen',
        },
        contentTypes: {
          label: 'Navigation aktivieren für',
          placeholder: 'z. B. Seiten, Beiträge',
          hint: 'Wenn nichts ausgewählt ist, sind keine Content-Types aktiviert',
        },
        defaultContentType: {
          label: 'Standard-Content-Type',
          placeholder: 'z. B. Seiten, Beiträge',
          hint: 'Standardmäßig ausgewählter Content-Type beim Erstellen eines neuen Navigationseintrags',
        },
        i18n: {
          label: 'i18n',
          hint: 'Internationalisierung aktivieren',
          hintMissingDefaultLocale: 'Standardsprache fehlt!',
        },
        allowedLevels: {
          label: 'Erlaubte Ebenen',
          placeholder: 'z. B. 2',
          hint: 'Maximale Ebene, auf der Einträge als "Im Menü anzeigen" markiert werden können',
        },
        audience: {
          label: 'Zielgruppe',
          hint: 'Zielgruppenfeld aktivieren',
        },
        nameField: {
          default: 'Standard',
          label: 'Namensfelder',
          placeholder: 'Mindestens eines auswählen oder leer lassen, um Standards zu verwenden',
          hint: 'Wenn leer, werden die folgenden Felder in dieser Reihenfolge verwendet: "title", "subject" und "name"',
          empty: 'Dieser Content-Type hat keine Textattribute',
        },
        populate: {
          label: 'Zu befüllende Felder',
          placeholder:
            'Mindestens eines auswählen oder leer lassen, um Relationsfelder nicht zu befüllen',
          hint: 'Ausgewählte Relationsfelder werden in API-Antworten befüllt',
          empty: 'Dieser Content-Type hat keine Relationsfelder',
        },
        pathDefaultFields: {
          label: 'Standardfelder für Pfad',
          placeholder:
            'Mindestens eines auswählen oder leer lassen, um die ID als Standardwert zu verwenden',
          hint: 'Der Wert des ausgewählten Attributs wird als Standardwert für interne Pfade verwendet',
          empty: 'Dieser Content-Type hat keine geeigneten Attribute',
        },
        contentTypesSettings: {
          label: 'Content-Types',
          tooltip: 'Benutzerdefinierte Konfiguration pro Content-Type',
          initializationWarning: {
            title: 'Warnung',
            content:
              '- Content-Type wurde noch nicht initialisiert. Initialisieren Sie ihn zuerst, um ihn im visuellen Editor verwenden zu können.',
          },
        },
        customFields: {
          table: {
            confirmation: {
              header: 'Benutzerdefiniertes Feld entfernen',
              message:
                'Diese Aktion entfernt alle Werte dieses benutzerdefinierten Felds aus Navigationseinträgen.',
              confirm: 'Fortfahren',
              error: 'Beim Entfernen des benutzerdefinierten Felds ist ein Fehler aufgetreten',
            },
            header: {
              name: 'Name',
              label: 'Label',
              type: 'Typ',
              required: 'Pflichtfeld',
            },
            footer: 'Neues benutzerdefiniertes Feld erstellen',
            edit: 'Benutzerdefiniertes Feld bearbeiten',
            enable: 'Benutzerdefiniertes Feld aktivieren',
            disable: 'Benutzerdefiniertes Feld deaktivieren',
            remove: 'Benutzerdefiniertes Feld entfernen',
            required: 'erforderlich',
            notRequired: 'nicht erforderlich',
          },
          popup: {
            header: {
              edit: 'Benutzerdefiniertes Feld bearbeiten',
              new: 'Neues benutzerdefiniertes Feld hinzufügen',
            },
            name: {
              label: 'Name des benutzerdefinierten Felds',
              placeholder: 'beispiel_name',
              description: 'Der Name des benutzerdefinierten Felds muss eindeutig sein',
              requiredError: 'Name ist erforderlich',
              noSpaceError: 'Leerzeichen sind nicht erlaubt',
            },
            label: {
              label: 'Label des benutzerdefinierten Felds',
              placeholder: 'Beispiel-Label',
              description: 'Dieses Label wird im Formular für Navigationseinträge angezeigt',
              requiredError: 'Label ist erforderlich',
            },
            description: {
              label: 'Beschreibung des benutzerdefinierten Felds',
              placeholder: 'Beispielbeschreibung',
              description:
                'Diese Beschreibung wird als Hinweis oder Erklärung unter dem Feld angezeigt',
            },
            placeholder: {
              label: 'Platzhalter des benutzerdefinierten Felds',
              placeholder: 'Beispiel-Platzhalter',
              description: 'Dieser Platzhaltertext erscheint vor der Eingabe innerhalb des Felds',
            },
            type: {
              label: 'Typ des benutzerdefinierten Felds',
              description: 'Der Typ legt fest, wie das Feld angezeigt wird',
            },
            required: {
              label: 'Pflichtfeld',
              description: 'Das Aktivieren ändert bestehende Navigationseinträge nicht',
            },
            options: {
              label: 'Optionen für Select-Feld',
              description: 'Optionen getrennt durch ";" angeben',
              requiredError: 'Mindestens eine Option ist erforderlich',
            },
            multi: {
              label: 'Mehrfachauswahl aktivieren',
              description: 'Einzel- oder Mehrfachauswahl erlauben',
            },
          },
        },
      },
      actions: {
        submit: 'Konfiguration speichern',
        restore: {
          label: 'Konfiguration wiederherstellen',
          confirmation: {
            header: 'Möchten Sie fortfahren?',
            confirm: 'Wiederherstellen',
            description: 'Plugin-Konfiguration wird aus der Datei plugins.js wiederhergestellt.',
          },
          description:
            "Beim Wiederherstellen wird die Plugin-Konfiguration durch die in 'plugins.js' gespeicherte Konfiguration ersetzt.",
        },
        restart: {
          label: 'Strapi neu starten',
          alert: {
            title: 'Strapi muss neu gestartet werden',
            description:
              'Sie haben Konfigurationsänderungen vorgenommen, die einen Neustart Ihrer Strapi-Anwendung erfordern. Starten Sie manuell neu oder verwenden Sie die Schaltfläche unten.',
            close: 'Verwerfen',
            cancel: 'Abbrechen',
            reason: {
              I18N: 'Internationalisierung (i18n) wird angewendet.',
              GRAPH_QL: 'GraphQL-Änderungen werden angewendet.',
              I18N_NAVIGATIONS_PRUNE: 'Veraltete Sprachversionen der Navigationen werden entfernt.',
            },
          },
        },
        disableI18n: {
          confirmation: {
            header: 'Internationalisierung deaktivieren',
            confirm: 'Ich verstehe',
            description: {
              line1:
                'Sie deaktivieren Internationalisierung für Navigation. Navigationen für andere Sprachen als die Standardsprache können über dieses Plugin nicht mehr angesehen oder geändert werden.',
              line2: 'Sie können Navigationen anderer Sprachen entfernen.',
              line3: 'Achtung: Entfernen ist endgültig.',
            },
          },
          prune: {
            label: 'Veraltete Navigationen',
            on: 'Entfernen',
            off: 'Behalten',
          },
        },
      },
      notification: {
        fetch: {
          error: 'Konfiguration konnte nicht geladen werden. Neuer Versuch...',
        },
        submit: {
          success: 'Konfiguration wurde erfolgreich aktualisiert',
          error: 'Aktualisierung der Konfiguration ist fehlgeschlagen',
        },
        restore: {
          success: 'Konfiguration wurde erfolgreich wiederhergestellt',
          error: 'Wiederherstellung der Konfiguration ist fehlgeschlagen',
        },
        restart: {
          success: 'Anwendung wurde erfolgreich neu gestartet',
          error: 'Anwendung konnte nicht neu gestartet werden. Bitte manuell versuchen.',
        },
      },
    },
    view: {
      actions: {
        i18nCopyItems: {
          confirmation: {
            header: 'Bestätigung',
            confirm: 'Kopieren',
            content: 'Möchten Sie Navigationseinträge kopieren?',
          },
        },
        changeLanguage: {
          confirmation: {
            header: 'Bestätigung',
            confirm: 'Fortfahren',
            content: 'Sie haben ungespeicherte Änderungen. Möchten Sie fortfahren?',
          },
        },
      },
    },
  },
  components: {
    toggle: {
      enabled: 'Aktiviert',
      disabled: 'Deaktiviert',
    },
    navigationItem: {
      action: {
        newItem: 'Untergeordneten Eintrag hinzufügen',
        edit: 'Bearbeiten',
        view: 'Ansehen',
        restore: 'Wiederherstellen',
        remove: 'Entfernen',
      },
      badge: {
        removed: 'Entfernt',
        draft: 'Entwurf',
        published: 'Veröffentlicht',
        attached: 'Im Menü',
        notAttached: 'Nicht im Menü',
      },
      related: {
        localeMissing: '(Sprachversion fehlt)',
      },
    },
    confirmation: {
      dialog: {
        button: {
          cancel: 'Abbrechen',
          confirm: 'Bestätigen',
        },
        description: 'Möchten Sie fortfahren?',
        header: 'Bestätigung',
      },
    },
    notAccessPage: {
      back: 'Zurück zur Startseite',
    },
  },
  view: {
    i18n: {
      fill: {
        option: 'Sprache {locale}',
        cta: {
          header: 'oder initialisieren',
          button: 'kopieren',
        },
      },
    },
  },
};

export default de;
