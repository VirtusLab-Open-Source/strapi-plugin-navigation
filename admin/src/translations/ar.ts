const ar = {
  plugin: {
    name: 'واجهة التنقل',
    section: {
      name: 'إضافة التنقل',
      item: 'الإعدادات',
    },
  },
  header: {
    title: 'التنقل',
    description: 'حدد قوائم التنقل في بوابتك',
    meta: 'المعرّف: { id }، الاسم المختصر: { key }',
    action: {
      newItem: 'عنصر جديد',
      manage: 'إدارة',
      collapseAll: 'طي الكل',
      expandAll: 'توسيع الكل',
    },
  },
  submit: {
    cta: {
      cancel: 'إلغاء',
      save: 'حفظ',
      cache: {
        purge: 'مسح ذاكرة التخزين المؤقت',
      },
    },
  },
  empty: {
    description: 'قائمة التنقل فارغة',
    cta: 'أنشئ أول عنصر',
  },
  popup: {
    navigation: {
      manage: {
        header: {
          LIST: 'جميع قوائم التنقل',
          CREATE: 'قائمة تنقل جديدة',
          DELETE: 'حذف',
          ERROR: 'خطأ',
          EDIT: 'تعديل "{name}"',
        },
        button: {
          cancel: 'إلغاء',
          delete: 'حذف',
          save: 'حفظ',
          edit: 'تعديل',
          create: 'إنشاء',
          goBack: 'رجوع',
          purge: 'مسح ذاكرة القراءة المؤقتة',
        },
        table: {
          id: 'المعرّف',
          name: 'الاسم',
          locale: 'نسخ اللغات',
          visibility: 'الظهور',
          hasSelected: 'تم تحديد {count} إدخالات',
        },
        footer: {
          button: {
            purge: 'مسح',
          },
        },
        purge: {
          header:
            'سيؤدي هذا الإجراء إلى مسح ذاكرة القراءة المؤقتة للواجهة البرمجية. سيتسبب ذلك في بطء مؤقت في قراءة قوائم التنقل أدناه.',
        },
        delete: {
          header: 'ستتم إزالة قوائم التنقل التالية:',
        },
        error: {
          header: 'حدث خطأ :(',
          message: 'حدث خطأ أثناء معالجة الطلب.',
        },
        navigation: {
          visible: 'ظاهرة',
          hidden: 'مخفية',
        },
      },
      form: {
        name: {
          label: 'الاسم',
          placeholder: 'اسم قائمة التنقل',
          validation: {
            name: {
              required: 'الاسم مطلوب',
              tooShort: 'الاسم قصير جدًا',
              alreadyUsed: 'الاسم مستخدم بالفعل',
            },
            visible: {
              required: 'الظهور مطلوب',
            },
          },
        },
        visible: {
          label: 'الظهور',
          toggle: {
            visible: 'ظاهرة',
            hidden: 'مخفية',
          },
        },
      },
    },
    item: {
      header: {
        view: 'عرض عنصر التنقل',
        edit: 'تعديل عنصر التنقل',
        new: 'عنصر تنقل جديد',
      },
      form: {
        title: {
          label: 'العنوان',
          autoSync: {
            label: 'قراءة الحقول من العنصر المرتبط',
          },
          placeholder: 'أدخل عنوان العنصر أو اتركه فارغًا لجلبه من الكيان المرتبط',
        },
        uiRouterKey: {
          label: 'مفتاح موجّه الواجهة',
          placeholder: 'إذا ترك فارغًا، يُولَّد تلقائيًا من "العنوان"',
        },
        uiRouter: {
          unableToRender:
            'تعذر عرض الاسم المختصر و/أو مفتاح موجّه الواجهة بسبب وجود أحرف غير مدعومة',
        },
        path: {
          label: 'الرابط',
          placeholder: 'جزء رابط فريد يعرّف هذا العنصر',
          preview: 'معاينة:',
        },
        externalPath: {
          label: 'رابط خارجي',
          placeholder: 'رابط إلى مصدر خارجي',
          validation: {
            type: 'هذه القيمة ليست رابطًا صالحًا.',
          },
        },
        menuAttached: {
          label: 'إرفاق بالقائمة',
          value: {
            yes: 'نعم',
            no: 'لا',
          },
        },
        type: {
          label: 'نوع عنصر التنقل',
          internal: {
            label: 'مصدر داخلي',
            source: 'الرابط مبني على: {value}',
          },
          external: {
            label: 'مصدر خارجي',
            description: 'المسار الناتج: {value}',
          },
          wrapper: {
            label: 'عنصر حاوٍ',
          },
        },
        audience: {
          label: 'الجمهور',
          placeholder: 'اختر الجمهور...',
          empty: 'لا يوجد المزيد من الجماهير',
        },
        relatedSection: {
          label: 'مرتبط بـ',
        },
        relatedType: {
          label: 'نوع المحتوى',
          placeholder: 'اختر نوع المحتوى...',
          empty: 'لا توجد أنواع محتوى للاختيار',
        },
        related: {
          label: 'الكيان',
          placeholder: 'اختر الكيان...',
          empty: 'لا توجد المزيد من كيانات "{ contentTypeName }" للاختيار',
        },
        i18n: {
          locale: {
            label: 'نسخ التفاصيل من',
            placeholder: 'اللغة',
            button: 'نسخ',
            error: {
              generic: 'تعذر نسخ العنصر',
              unavailable: 'نسخة اللغة غير متاحة',
            },
          },
        },
        button: {
          create: 'إنشاء عنصر',
          update: 'تحديث العنصر',
          restore: 'استعادة العنصر',
          remove: 'إزالة',
          save: 'حفظ',
          cancel: 'إلغاء',
        },
      },
    },
  },
  notification: {
    navigation: {
      submit: 'تم حفظ تغييرات التنقل',
      error: 'مسار مكرر: "{ path }" في العنصر الأب: "{ parentTitle }" للعناصر { errorTitles }',
      item: {
        relation: 'علاقة الكيان غير موجودة!',
        status: {
          draft: 'مسودة',
          published: 'منشور',
        },
      },
      update: {
        error: 'تعذر حفظ قائمة التنقل. تحقق من أدوات المطور.',
      },
    },
    error: {
      common: 'حدث خطأ أثناء معالجة الطلب.',
      customField: {
        type: 'نوع الحقل المخصص غير مدعوم',
        media: {
          missing: 'مكوّن إدخال الوسائط مفقود',
        },
      },
      item: {
        relation: 'العلاقات المقدمة في بعض العناصر غير صحيحة',
        slug: 'تعذر إنشاء مفتاح موجّه واجهة (اسم مختصر) صالح من "{ query }". النتيجة المستلمة: "{ result }"',
      },
    },
  },
  pages: {
    auth: {
      noAccess: 'لا يوجد صلاحية وصول',
      not: {
        allowed: 'عذرًا! يبدو أنه ليس لديك صلاحية الوصول إلى هذه الصفحة...',
      },
    },
    main: {
      search: {
        placeholder: 'اكتب لبدء البحث...',
        subLabel: 'اضغط ENTER لتمييز العنصر التالي',
      },
      header: {
        localization: {
          select: {
            placeholder: 'اختر اللغة',
          },
        },
      },
    },
    settings: {
      title: 'إعدادات التنقل',
      general: {
        title: 'الإعدادات العامة',
      },
      additional: {
        title: 'إعدادات إضافية',
      },
      customFields: {
        title: 'إعدادات الحقول المخصصة',
      },
      nameField: {
        title: 'إعدادات أنواع المحتوى',
      },
      restoring: {
        title: 'الاستعادة',
      },
      section: {
        title: 'إضافة التنقل',
        subtitle: 'الإعدادات',
      },
      header: {
        title: 'التنقل',
        description: 'قم بإعداد إضافة التنقل',
      },
      form: {
        cascadeMenuAttached: {
          label: 'تعميم إرفاق القائمة',
          hint: 'عطّله إذا كنت لا تريد أن يمتد "إرفاق بالقائمة" إلى العناصر الفرعية',
        },
        preferCustomContentTypes: {
          label: 'تفضيل أنواع محتوى الواجهة البرمجية',
          hint: 'فضّل استخدام أنواع المحتوى ذات البادئة api:: فقط',
        },
        contentTypes: {
          label: 'تفعيل التنقل لـ',
          placeholder: 'مثال: الصفحات، المقالات',
          hint: 'إذا لم يتم تحديد أي نوع، فلن يتم تفعيل أي نوع من أنواع المحتوى',
        },
        defaultContentType: {
          label: 'نوع المحتوى الافتراضي',
          placeholder: 'مثال: الصفحات، المقالات',
          hint: 'نوع المحتوى المحدد افتراضيًا عند إنشاء عنصر تنقل جديد',
        },
        i18n: {
          label: 'i18n',
          hint: 'تفعيل التدويل',
          hintMissingDefaultLocale: 'اللغة الافتراضية مفقودة!',
        },
        allowedLevels: {
          label: 'المستويات المسموحة',
          placeholder: 'مثال: 2',
          hint: 'أقصى مستوى يمكنك فيه تعيين عنصر كـ "مرفق بالقائمة"',
        },
        audience: {
          label: 'الجمهور',
          hint: 'تفعيل حقل الجمهور',
        },
        nameField: {
          default: 'افتراضي',
          label: 'حقول الاسم',
          placeholder: 'اختر حقلًا واحدًا على الأقل أو اتركه فارغًا لتطبيق الافتراضيات',
          hint: 'إذا ترك فارغًا، سيأخذ حقل الاسم الحقول التالية بالترتيب: "title" و"subject" و"name"',
          empty: 'نوع المحتوى هذا لا يحتوي على أي سمات نصية',
        },
        populate: {
          label: 'الحقول المراد تضمينها',
          placeholder: 'اختر حقلًا واحدًا على الأقل أو اتركه فارغًا لتعطيل تضمين حقول العلاقات',
          hint: 'سيتم تضمين حقول العلاقات المحددة في استجابات الواجهة البرمجية',
          empty: 'نوع المحتوى هذا لا يحتوي على أي حقول علاقات',
        },
        pathDefaultFields: {
          label: 'الحقول الافتراضية للمسار',
          placeholder: 'اختر حقلًا واحدًا على الأقل أو اتركه فارغًا لاستخدام المعرّف كقيمة افتراضية',
          hint: 'ستكون قيمة السمة المحددة هي القيمة الافتراضية للمسار الداخلي',
          empty: 'نوع المحتوى هذا لا يحتوي على أي سمات مناسبة',
        },
        contentTypesSettings: {
          label: 'أنواع المحتوى',
          tooltip: 'إعدادات مخصصة لكل نوع محتوى',
          initializationWarning: {
            title: 'تحذير',
            content:
              '- لم تتم تهيئة نوع المحتوى بعد. قم بتهيئته أولًا لتتمكن من استخدامه في المحرر المرئي.',
          },
        },
        customFields: {
          table: {
            confirmation: {
              header: 'إزالة الحقل المخصص',
              message: 'سيؤدي هذا الإجراء إلى إزالة جميع قيم الحقل المخصص من عناصر التنقل.',
              confirm: 'متابعة',
              error: 'حدث خطأ أثناء إزالة الحقل المخصص',
            },
            header: {
              name: 'الاسم',
              label: 'التسمية',
              type: 'النوع',
              required: 'مطلوب',
            },
            footer: 'إنشاء حقل مخصص جديد',
            edit: 'تعديل الحقل المخصص',
            enable: 'تفعيل الحقل المخصص',
            disable: 'تعطيل الحقل المخصص',
            remove: 'إزالة الحقل المخصص',
            required: 'مطلوب',
            notRequired: 'غير مطلوب',
          },
          popup: {
            header: {
              edit: 'تعديل الحقل المخصص',
              new: 'إضافة حقل مخصص جديد',
            },
            name: {
              label: 'اسم الحقل المخصص',
              placeholder: 'example_name',
              description: 'يجب أن يكون اسم الحقل المخصص فريدًا',
              requiredError: 'الاسم مطلوب',
              noSpaceError: 'المسافات غير مسموحة',
            },
            label: {
              label: 'تسمية الحقل المخصص',
              placeholder: 'تسمية مثال',
              description: 'ستُعرض هذه التسمية في نموذج عنصر التنقل',
              requiredError: 'التسمية مطلوبة',
            },
            description: {
              label: 'وصف الحقل المخصص',
              placeholder: 'وصف مثال',
              description: 'سيُعرض هذا الوصف أسفل الحقل كتلميح أو توضيح',
            },
            placeholder: {
              label: 'نص بديل للحقل المخصص',
              placeholder: 'نص بديل مثال',
              description: 'سيظهر هذا النص داخل الحقل قبل التفاعل معه',
            },
            type: {
              label: 'نوع الحقل المخصص',
              description: 'نوع الحقل المخصص، يحدد كيفية عرضه',
            },
            required: {
              label: 'جعل الحقل مطلوبًا',
              description: 'لن يؤدي تفعيل هذا الخيار إلى تغيير عناصر التنقل الموجودة بالفعل',
            },
            options: {
              label: 'خيارات حقل الاختيار',
              description: 'قدّم الخيارات مفصولة بـ ";"',
              requiredError: 'مطلوب خيار واحد على الأقل',
            },
            multi: {
              label: 'تفعيل الاختيار المتعدد',
              description: 'السماح باختيار خيار واحد أو عدة خيارات',
            },
          },
        },
      },
      actions: {
        submit: 'حفظ الإعدادات',
        restore: {
          label: 'استعادة الإعدادات',
          confirmation: {
            header: 'هل تريد المتابعة؟',
            confirm: 'استعادة',
            description: 'ستتم استعادة إعدادات الإضافة من ملف plugins.js.',
          },
          description:
            "ستؤدي استعادة إعدادات الإضافة إلى استبدالها بالإعدادات المحفوظة داخل ملف 'plugins.js'.",
        },
        restart: {
          label: 'إعادة تشغيل Strapi',
          alert: {
            title: 'يتطلب Strapi إعادة التشغيل',
            description:
              'لقد أجريت تغييرات في الإعدادات تتطلب إعادة تشغيل تطبيق Strapi حتى تدخل حيز التنفيذ. قم بذلك يدويًا أو باستخدام الزر أدناه.',
            close: 'تجاهل',
            cancel: 'إلغاء',
            reason: {
              I18N: 'سيتم تطبيق تغييرات التدويل (i18n).',
              GRAPH_QL: 'سيتم تطبيق تغييرات GraphQL.',
              I18N_NAVIGATIONS_PRUNE: 'ستتم إزالة قوائم التنقل الخاصة باللغات القديمة.',
            },
          },
        },
        disableI18n: {
          confirmation: {
            header: 'تعطيل التدويل',
            confirm: 'أفهم ذلك',
            description: {
              line1:
                'أنت بصدد تعطيل التدويل للتنقل. قوائم التنقل الخاصة باللغات غير الافتراضية لن تكون متاحة للعرض أو التعديل عبر هذه الإضافة.',
              line2: 'يمكنك اختيار إزالة قوائم التنقل الخاصة باللغات الأخرى.',
              line3: 'تذكّر! الإزالة لا يمكن التراجع عنها',
            },
          },
          prune: {
            label: 'قوائم التنقل القديمة',
            on: 'إزالة',
            off: 'الاحتفاظ',
          },
        },
      },
      notification: {
        fetch: {
          error: 'فشل جلب الإعدادات. جارٍ إعادة المحاولة...',
        },
        submit: {
          success: 'تم تحديث الإعدادات بنجاح',
          error: 'فشل تحديث الإعدادات',
        },
        restore: {
          success: 'تمت استعادة الإعدادات بنجاح',
          error: 'فشلت استعادة الإعدادات',
        },
        restart: {
          success: 'تمت إعادة تشغيل التطبيق بنجاح',
          error: 'فشلت إعادة تشغيل التطبيق. حاول القيام بذلك يدويًا.',
        },
      },
    },
    view: {
      actions: {
        i18nCopyItems: {
          confirmation: {
            header: 'تأكيد',
            confirm: 'نسخ',
            content: 'هل تريد نسخ عناصر التنقل؟',
          },
        },
        changeLanguage: {
          confirmation: {
            header: 'تأكيد',
            confirm: 'متابعة',
            content: 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟',
          },
        },
      },
    },
  },
  components: {
    toggle: {
      enabled: 'مفعّل',
      disabled: 'معطّل',
    },
    navigationItem: {
      action: {
        newItem: 'إضافة عنصر فرعي',
        edit: 'تعديل',
        view: 'عرض',
        restore: 'استعادة',
        remove: 'إزالة',
      },
      badge: {
        removed: 'محذوف',
        draft: 'مسودة',
        published: 'منشور',
      },
      related: {
        localeMissing: '(نسخة اللغة مفقودة)',
      },
    },
    confirmation: {
      dialog: {
        button: {
          cancel: 'إلغاء',
          confirm: 'تأكيد',
        },
        description: 'هل تريد المتابعة؟',
        header: 'تأكيد',
      },
    },
    notAccessPage: {
      back: 'العودة إلى الصفحة الرئيسية',
    },
  },
  view: {
    i18n: {
      fill: {
        option: 'اللغة {locale}',
        cta: {
          header: 'أو ابدأ بنسخ',
          button: 'نسخ',
        },
      },
    },
  },
};

export default ar;
