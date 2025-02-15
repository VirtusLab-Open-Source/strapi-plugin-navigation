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
  },
};

export default tr;

export type TR = typeof tr;
