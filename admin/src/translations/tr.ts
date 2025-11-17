const tr = {
  plugin: {
    name: 'UI Navigasyon',
    section: {
      name: 'Navigasyon eklentisi',
      item: 'Yapılandırma',
    },
  },
  header: {
    title: 'Navigasyon',
    description: 'Portal navigasyonunuzu tanımlayın',
    meta: 'ID: { id }, slug: { key }',
    action: {
      newItem: 'Yeni Öğe',
      manage: 'Yönet',
      collapseAll: 'Tümünü Daralt',
      expandAll: 'Tümünü Genişlet',
    },
  },
  submit: {
    cta: {
      cancel: 'İptal',
      save: 'Kaydet',
    },
  },
  empty: {
    description: 'Navigasyonunuz boş',
    cta: 'İlk öğeyi oluştur',
  },
  popup: {
    navigation: {
      manage: {
        header: {
          LIST: 'Tüm navigasyonlar',
          CREATE: 'Yeni navigasyon',
          DELETE: 'Silme işlemi',
          ERROR: 'Hata',
          EDIT: '"{name}" düzenleniyor',
        },
        button: {
          cancel: 'İptal',
          delete: 'Sil',
          save: 'Kaydet',
          edit: 'Düzenle',
          create: 'Oluştur',
          goBack: 'Geri dön',
          purge: 'Önbelleği temizle',
        },
        table: {
          id: 'Id',
          name: 'Ad',
          locale: 'Dil versiyonları',
          visibility: 'Görünürlük',
          hasSelected: '{count} öğe seçildi',
        },
        footer: {
          button: {
            purge: 'Temizle',
          },
        },
        purge: {
          header:
            'Bu işlem API okuma önbelleğini temizleyecektir. Aşağıdaki navigasyonlar için kısa bir yavaşlama yaşanacaktır.',
        },
        delete: {
          header: 'Aşağıdaki navigasyonlar kaldırılacaktır:',
        },
        error: {
          header: 'Bir hata oluştu :(',
          message: 'İstek işlenirken bir hata oluştu.',
        },
        navigation: {
          visible: 'görünür',
          hidden: 'gizli',
        },
      },
      form: {
        name: {
          label: 'Ad',
          placeholder: 'Navigasyon adı',
          validation: {
            name: {
              required: 'Ad gereklidir',
              tooShort: 'Ad çok kısa',
              alreadyUsed: 'Ad zaten kullanılıyor',
            },
            visible: {
              required: 'Görünürlük gereklidir',
            },
          },
        },
        visible: {
          label: 'Görünürlük',
          toggle: {
            visible: 'Görünür',
            hidden: 'Gizli',
          },
        },
      },
    },
    item: {
      header: {
        view: 'Navigasyon öğesini görüntüle',
        edit: 'Navigasyon öğesini düzenle',
        new: 'Yeni navigasyon öğesi',
      },
      form: {
        title: {
          label: 'Başlık',
          autoSync: {
            label: 'İlgili alanlardan oku',
          },
          placeholder: 'Öğe başlığını girin veya ilgili varlıktan almak için boş bırakın',
        },
        uiRouterKey: {
          label: 'UI yönlendirici anahtarı',
          placeholder: 'Boşsa, "Başlık" tarafından otomatik olarak oluşturulur',
        },
        uiRouter: {
          unableToRender:
            'Slug ve/veya UI Yönlendirici Anahtarı desteklenmeyen karakterler nedeniyle oluşturulamıyor',
        },
        path: {
          label: 'URL',
          placeholder: 'Bu öğeyi tanımlayan benzersiz URL bölümü',
          preview: 'Önizleme:',
        },
        externalPath: {
          label: 'Harici URL',
          placeholder: 'Harici kaynağa bağlantı',
          validation: {
            type: 'Bu değer geçerli bir URL değil.',
          },
        },
        menuAttached: {
          label: 'Menüye ekle',
          value: {
            yes: 'Evet',
            no: 'Hayır',
          },
        },
        type: {
          label: 'Navigasyon öğesi türü',
          internal: {
            label: 'Dahili kaynak',
            source: 'URL dayalı: {value}',
          },
          external: {
            label: 'Harici kaynak',
            description: 'Çıktı yolu: {value}',
          },
          wrapper: {
            label: 'Sarma öğesi',
          },
        },
        audience: {
          label: 'Hedef kitle',
          placeholder: 'Hedef kitle seç...',
          empty: 'Daha fazla hedef kitle yok',
        },
        relatedSection: {
          label: 'İlişkilendirilen',
        },
        relatedType: {
          label: 'İçerik Türü',
          placeholder: 'İçerik türü seç...',
          empty: 'Seçilebilecek içerik türü yok',
        },
        related: {
          label: 'Varlık',
          placeholder: 'Varlık seç...',
          empty: '"{ contentTypeName }" için başka varlık yok',
        },
        i18n: {
          locale: {
            label: 'Şu detaylardan kopyala',
            placeholder: 'Yerel ayar',
            button: 'Kopyala',
            error: {
              generic: 'Öğe kopyalanamadı',
              unavailable: 'Yerel sürüm mevcut değil',
            },
          },
        },
        button: {
          create: 'Öğe oluştur',
          update: 'Öğeyi güncelle',
          restore: 'Öğeyi geri yükle',
          remove: 'Kaldır',
          save: 'Kaydet',
          cancel: 'İptal',
        },
      },
    },
  },
  notification: {
    navigation: {
      submit: 'Navigasyon değişiklikleri kaydedildi',
      error: 'Yinelenen yol: "{ path }", üst öğe: "{ parentTitle }" için { errorTitles } öğe',
      item: {
        relation: 'Varlık ilişkisi mevcut değil!',
        status: {
          draft: 'taslak',
          published: 'yayınlandı',
        },
      },
      update: {
        error: 'Navigasyon kaydedilemedi. Geliştirici araçlarını kontrol edin.',
      },
    },
    error: {
      common: 'İstek işlenirken hata oluştu.',
      customField: {
        type: 'Desteklenmeyen özel alan türü',
        media: {
          missing: 'Medya giriş bileşeni eksik',
        },
      },
      item: {
        relation: 'Bazı öğelerde sağlanan ilişkiler yanlış',
        slug: '"{ query }" öğesinden geçerli bir UI Router Anahtarı (slug) oluşturulamadı. "{ result }" alındı',
      },
    },
  },
  pages: {
    auth: {
      noAccess: 'Erişim yok',
      not: {
        allowed: 'Üzgünüz! Bu sayfaya erişim yetkiniz yok gibi görünüyor...',
      },
    },
    main: {
      search: {
        placeholder: 'Arama yapmak için yazmaya başlayın...',
        subLabel: 'Bir sonraki öğeyi vurgulamak için ENTER tuşuna basın',
      },
      header: {
        localization: {
          select: {
            placeholder: 'Dil seçin',
          },
        },
      },
    },
    settings: {
      title: 'Navigasyon ayarları',
      general: {
        title: 'Genel ayarlar',
      },
      additional: {
        title: 'Ek ayarlar',
      },
      customFields: {
        title: 'Özel alan ayarları',
      },
      nameField: {
        title: 'İçerik türü ayarları',
      },
      restoring: {
        title: 'Geri yükleme',
      },
      section: {
        title: 'Navigasyon Eklentisi',
        subtitle: 'Yapılandırma',
      },
      header: {
        title: 'Navigasyon',
        description: 'Navigasyon eklentisini yapılandır',
      },
      form: {
        cascadeMenuAttached: {
          label: 'Kademeli menü eklendi',
          hint: '"Menü eklendi" seçeneğinin alt öğelere yayılmasını istemiyorsanız devre dışı bırakın',
        },
        preferCustomContentTypes: {
          label: 'Özel API İçerik Türlerini Tercih Et',
          hint: 'Yalnızca api:: önekli içerik türlerini kullanmayı tercih edin',
        },
        contentTypes: {
          label: 'Navigasyonu etkinleştir',
          placeholder: 'Örn: Sayfalar, Gönderiler',
          hint: 'Hiçbiri seçilmezse, içerik türleri de etkinleştirilmez',
        },
        defaultContentType: {
          label: 'Varsayılan içerik türü',
          placeholder: 'Örn: Sayfalar, Gönderiler',
          hint: 'Yeni bir gezinme öğesi oluşturulurken varsayılan olarak seçilen içerik türü',
        },
        i18n: {
          label: 'i18n',
          hint: 'Uluslararasılaştırmayı etkinleştir',
          hintMissingDefaultLocale: 'Varsayılan dil eksik!',
        },
        allowedLevels: {
          label: 'İzin verilen seviyeler',
          placeholder: 'Örn: 2',
          hint: '"Menü eklendi" olarak işaretleyebileceğiniz maksimum seviye',
        },
        audience: {
          label: 'Hedef kitle',
          hint: 'Hedef kitle alanını etkinleştir',
        },
        nameField: {
          default: 'Varsayılan',
          label: 'Ad alanları',
          placeholder: 'En az birini seçin veya varsayılanları uygulamak için boş bırakın',
          hint: 'Boş bırakılırsa, ad alanı aşağıdaki sırayla alanları alacaktır: "başlık", "konu" ve "ad"',
          empty: 'Bu içerik türünde dize nitelikleri bulunmuyor',
        },
        populate: {
          label: 'Doldurulacak alanlar',
          placeholder:
            'En az birini seçin veya ilişki alanlarını doldurmayı devre dışı bırakmak için boş bırakın',
          hint: 'Seçilen ilişki alanları API yanıtlarında doldurulacaktır',
          empty: 'Bu içerik türünde ilişki alanları bulunmuyor',
        },
        pathDefaultFields: {
          label: 'Varsayılan yol alanları',
          placeholder:
            'En az birini seçin veya yol alanını nitelik değeriyle doldurmayı devre dışı bırakın',
          hint: 'Seçilen nitelik değeri, dahili yol için varsayılan değer olacaktır',
          empty: 'Bu içerik türünde uygun nitelikler bulunmuyor',
        },
        contentTypesSettings: {
          label: 'İçerik türleri',
          tooltip: 'İçerik türüne özel yapılandırma',
          initializationWarning: {
            title: 'Uyarı',
            content:
              '- İçerik Türü henüz başlatılmadı. Görsel Düzenleyici kullanabilmek için önce başlatın.',
          },
        },
        customFields: {
          table: {
            confirmation: {
              header: 'Özel alan kaldırılıyor',
              message: 'Bu işlem, navigasyon öğelerinden tüm özel alan değerlerini kaldıracaktır.',
              confirm: 'Devam et',
              error: 'Özel alan kaldırılırken bir hata oluştu',
            },
            header: {
              name: 'Ad',
              label: 'Etiket',
              type: 'Tür',
              required: 'Gerekli',
            },
            footer: 'Yeni özel alan oluştur',
            edit: 'Özel alanı düzenle',
            enable: 'Özel alanı etkinleştir',
            disable: 'Özel alanı devre dışı bırak',
            remove: 'Özel alanı kaldır',
            required: 'gerekli',
            notRequired: 'gerekli değil',
          },
          popup: {
            header: {
              edit: 'Özel alanı düzenle',
              new: 'Yeni özel alan ekle',
            },
            name: {
              label: 'Özel alan adı',
              placeholder: 'ornek_ad',
              description: 'Özel alan adı benzersiz olmalıdır',
              requiredError: 'İsim zorunludur',
              noSpaceError: 'Boşluk izin verilmiyor',
            },
            label: {
              label: 'Özel alan etiketi',
              placeholder: 'Örnek etiket',
              description: 'Bu etiket navigasyon öğesi formunda gösterilecektir',
              requiredError: 'Etiket zorunludur',
            },
            description: {
              label: 'Özel alan açıklaması',
              placeholder: 'Örnek açıklama',
              description: 'Bu açıklama, alanın altında ipucu veya açıklama olarak gösterilecektir',
            },
            placeholder: {
              label: 'Özel alan yer tutucu',
              placeholder: 'Örnek yer tutucu',
              description:
                'Bu yer tutucu metin, kullanıcı etkileşimde bulunmadan önce alanda görünecektir',
            },
            type: {
              label: 'Özel alan türü',
              description: 'Özel alanın nasıl görüntüleneceğini tanımlar',
            },
            required: {
              label: 'Alan zorunlu mu?',
              description: 'Bu alanı etkinleştirmek, mevcut navigasyon öğelerini değiştirmez',
            },
            options: {
              label: 'Seçim giriş seçenekleri',
              description: 'Seçenekleri ";" ile ayırarak girin',
              requiredError: 'En az bir seçenek gereklidir',
            },
            multi: {
              label: 'Çoklu seçim girişini etkinleştir',
              description: 'Tek veya birden fazla seçenek seçimine izin ver',
            },
          },
        },
      },
      actions: {
        submit: 'Yapılandırmayı kaydet',
        restore: {
          label: 'Yapılandırmayı geri yükle',
          confirmation: {
            header: 'Devam etmek istiyor musunuz?',
            confirm: 'Geri yükle',
            description: 'Eklenti yapılandırması plugins.js dosyasından geri yüklenecektir.',
          },
          description:
            "Eklenti yapılandırmasını geri yüklemek, 'plugins.js' dosyasındaki yapılandırma ile değiştirilecektir.",
        },
        restart: {
          label: "Strapi'yi yeniden başlat",
          alert: {
            title: 'Strapi yeniden başlatılmalı',
            description:
              'Yapılandırmada değişiklikler yaptınız ve bu değişikliklerin etkili olabilmesi için Strapi uygulamanızın yeniden başlatılması gerekiyor. Manuel olarak veya aşağıdaki tetikleyiciyi kullanarak yapabilirsiniz.',
            close: 'Vazgeç',
            cancel: 'İptal',
            reason: {
              I18N: 'Uluslararasılaştırma (i18n) değişiklikleri uygulanacaktır.',
              GRAPH_QL: 'GraphQL değişiklikleri uygulanacaktır.',
              I18N_NAVIGATIONS_PRUNE: 'Kullanılmayan yerel dil navigasyonları kaldırılacaktır.',
            },
          },
        },
        disableI18n: {
          confirmation: {
            header: 'Uluslararasılaştırmayı Devre Dışı Bırakma',
            confirm: 'Anladım',
            description: {
              line1:
                'Navigasyon için Uluslararasılaştırmayı devre dışı bırakıyorsunuz. Varsayılan dil dışındaki navigasyonlar, bu eklenti üzerinden görüntülenemez veya düzenlenemez.',
              line2: 'Diğer diller için navigasyonları kaldırmayı seçebilirsiniz.',
              line3: 'Unutmayın! Kaldırma işlemi geri alınamaz.',
            },
          },
          prune: {
            label: 'Kullanılmayan navigasyonlar',
            on: 'Kaldır',
            off: 'Tut',
          },
        },
      },
      notification: {
        fetch: {
          error: 'Yapılandırma alınamadı. Tekrar deneniyor...',
        },
        submit: {
          success: 'Yapılandırma başarıyla güncellendi',
          error: 'Yapılandırma güncellenirken hata oluştu',
        },
        restore: {
          success: 'Yapılandırma başarıyla geri yüklendi',
          error: 'Yapılandırma geri yüklenirken hata oluştu',
        },
        restart: {
          success: 'Uygulama başarıyla yeniden başlatıldı',
          error: 'Uygulamanız yeniden başlatılamadı. Manuel olarak tekrar deneyin.',
        },
      },
    },
    view: {
      actions: {
        i18nCopyItems: {
          confirmation: {
            header: 'Onay',
            confirm: 'Kopyala',
            content: 'Navigasyon öğelerini kopyalamak istiyor musunuz?',
          },
        },
        changeLanguage: {
          confirmation: {
            header: 'Onay',
            confirm: 'Devam Et',
            content: 'Kaydedilmemiş değişiklikleriniz var. Devam etmek istiyor musunuz?',
          },
        },
      },
    },
  },
  components: {
    toggle: {
      enabled: 'Etkin',
      disabled: 'Devre dışı',
    },
    navigationItem: {
      action: {
        newItem: 'İç içe öğe ekle',
        edit: 'Düzenle',
        view: 'Görüntüle',
        restore: 'Geri yükle',
        remove: 'Kaldır',
      },
      badge: {
        removed: 'Kaldırıldı',
        draft: 'Taslak',
        published: 'Yayınlandı',
      },
      related: {
        localeMissing: '(Yerel sürüm eksik)',
      },
    },
    confirmation: {
      dialog: {
        button: {
          cancel: 'İptal',
          confirm: 'Onayla',
        },
        description: 'Devam etmek istiyor musunuz?',
        header: 'Onay',
      },
    },
    notAccessPage: {
      back: 'Ana sayfaya dön',
    },
  },
  view: {
    i18n: {
      fill: {
        option: '{locale} dili',
        cta: {
          header: 'veya başlat',
          button: 'kopyala',
        },
      },
    },
  },
};

export default tr;

export type TR = typeof tr;
