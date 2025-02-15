const es = {
  plugin: {
    name: 'Navegación UI',
    section: {
      name: 'Plugin de navegación',
      item: 'Configuración',
    },
  },
  header: {
    title: 'Navegación',
    description: 'Define la navegación de tu portal',
    meta: 'ID: { id }, slug: { key }',
    action: {
      newItem: 'Nuevo ítem',
      manage: 'Gestionar',
      collapseAll: 'Colapsar todo',
      expandAll: 'Expandir todo',
    },
  },
  submit: {
    cta: {
      cancel: 'Cancelar',
      save: 'Guardar',
    },
  },
  empty: {
    description: 'Tu navegación está vacía',
    cta: 'Crear primer ítem',
  },
  popup: {
    navigation: {
      manage: {
        header: {
          LIST: 'Todas las navegaciones',
          CREATE: 'Nueva navegación',
          DELETE: 'Eliminando',
          ERROR: 'Error',
          EDIT: 'Editando "{name}"',
        },
        button: {
          cancel: 'Cancelar',
          delete: 'Eliminar',
          save: 'Guardar',
          edit: 'Editar',
          create: 'Crear',
          goBack: 'Volver',
          purge: 'Borrar caché de lectura',
        },
        table: {
          id: 'Id',
          name: 'Nombre',
          locale: 'Versiones de idioma',
          visibility: 'Visibilidad',
          hasSelected: '{count} entradas seleccionadas',
        },
        footer: {
          button: {
            purge: 'Borrar',
          },
        },
        purge: {
          header:
            'Esta acción limpiará la caché de lectura de la API. Esto provocará una breve ralentización en las lecturas de las navegaciones a continuación.',
        },
        delete: {
          header: 'Se eliminarán las siguientes navegaciones:',
        },
        error: {
          header: 'Ha ocurrido un error :(',
          message: 'Ocurrió un error al procesar la solicitud.',
        },
        navigation: {
          visible: 'visible',
          hidden: 'oculto',
        },
      },
      form: {
        name: {
          label: 'Nombre',
          placeholder: 'Nombre de la navegación',
          validation: {
            name: {
              required: 'El nombre es obligatorio',
              tooShort: 'El nombre es demasiado corto',
              alreadyUsed: 'El nombre ya está en uso',
            },
            visible: {
              required: 'La visibilidad es obligatoria',
            },
          },
        },
        visible: {
          label: 'Visibilidad',
          toggle: {
            visible: 'Visible',
            hidden: 'Oculto',
          },
        },
      },
    },
  },
};

export default es;

export type ES = typeof es;
