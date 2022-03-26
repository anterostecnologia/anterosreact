var Calendar = {
    formatYear: 'YYYY',
    formatMonth: 'MMM YYYY',
    today: 'Hoje',
    view: {
        month: 'Mês',
        year: 'Ano',
        week: 'Semana',
        day: 'Dia',
    },
    month: {
        long: {
            January: 'Janeiro',
            February: 'Fevereiro',
            March: 'Março',
            April: 'Abril',
            May: 'Maio',
            June: 'Junho',
            July: 'Julho',
            August: 'Agosto',
            September: 'Setembro',
            October: 'Outubro',
            November: 'Novembro',
            December: 'Dezembro',
        },
        short: {
            January: 'Jan',
            February: 'Fev',
            March: 'Mar',
            April: 'Abr',
            May: 'Mai',
            June: 'Jun',
            July: 'Jul',
            August: 'Ago',
            September: 'Set',
            October: 'Out',
            November: 'Nov',
            December: 'Dez',
        },
    },
    week: {
        long: {
            self: 'Semana',
            monday: 'Segunda',
            tuesday: 'Terça',
            wednesday: 'Quarta',
            thursday: 'Quinta',
            friday: 'Sexta',
            saturday: 'Sábado',
            sunday: 'Domingo',
        },
        short: {
            self: 'Sem',
            monday: 'Seg',
            tuesday: 'Ter',
            wednesday: 'Qua',
            thursday: 'Qui',
            friday: 'Sex',
            saturday: 'Sáb',
            sunday: 'Dom',
        },
    },
};
export default {
    locale: 'pt-BR',
    Calendar: Calendar,
    DatePicker: {
        Calendar: Calendar,
        placeholder: {
            date: 'Selecione a data',
            week: 'Selecione a semana',
            month: 'Selecione o mês',
            year: 'Selecione o ano',
            quarter: 'Selecione o trimestre',
        },
        placeholders: {
            date: ['Data inicio', 'Data final'],
            week: ['Semana inicio', 'Semana final'],
            month: ['Mês inicio', 'Mês final'],
            year: ['Ano inicial', 'Ano final'],
            quarter: ['Trimestre inicio', 'Trimestre final'],
        },
        selectTime: 'Selecione a hora',
        selectDate: 'Seleciona a data',
        today: 'Hoje',
        now: 'Agora',
        ok: 'Ok',
    },
    Drawer: {
        okText: 'Ok',
        cancelText: 'Cancela',
    },
    Empty: {
        noData: 'Sem dados',
    },
    Modal: {
        okText: 'OK',
        cancelText: 'Cancel',
    },
    Pagination: {
        goto: 'Ir',
        page: 'Página',
        countPerPage: ' / Página',
        total: 'Total: {0}',
    },
    Popconfirm: {
        okText: 'OK',
        cancelText: 'Cancela',
    },
    Table: {
        okText: 'Ok',
        resetText: 'Limpar',
        sortAscend: 'Click para ordenar crescente',
        sortDescend: 'Click para ordenar decrescente',
        cancelSort: 'Click para cancelar ordenação',
    },
    TimePicker: {
        ok: 'OK',
        placeholder: 'Selecione a hora',
        placeholders: ['Hora inicial', 'Hora final'],
        now: 'Now',
    },
    Progress: {
        success: 'Concluído',
        error: 'Falhou',
    },
    Upload: {
        start: 'Iniciar',
        cancel: 'Cancelar',
        delete: 'Remover',
        reupload: 'Tentar novamente',
        upload: 'Enviar',
        preview: 'Visualizar',
        drag: 'Clique ou arraste o arquivo para esta área para fazer envio',
        dragHover: 'Solte para enviar',
        error: 'Erro no envio',
    },
    Typography: {
        copy: 'Copiar',
        copied: 'Copiado',
        edit: 'Editar',
        fold: 'Fold',
        unfold: 'Desdobrar',
    },
    Transfer: {
        resetText: 'Limpar',
    },
    ImagePreview: {
        fullScreen: 'Tela cheia',
        rotateRight: 'Girar a direita',
        rotateLeft: 'Girar a esquerda',
        zoomIn: 'Mais Zoom',
        zoomOut: 'Menos Zoom',
        originalSize: 'Tamanho original',
    },
};