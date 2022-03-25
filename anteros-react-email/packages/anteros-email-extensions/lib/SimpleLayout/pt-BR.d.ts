declare namespace _default {
    export const locale: string;
    export { Calendar };
    export namespace DatePicker {
        export { Calendar };
        export namespace placeholder {
            const date: string;
            const week: string;
            const month: string;
            const year: string;
            const quarter: string;
        }
        export namespace placeholders {
            const date_1: string[];
            export { date_1 as date };
            const week_1: string[];
            export { week_1 as week };
            const month_1: string[];
            export { month_1 as month };
            const year_1: string[];
            export { year_1 as year };
            const quarter_1: string[];
            export { quarter_1 as quarter };
        }
        export const selectTime: string;
        export const selectDate: string;
        export const today: string;
        export const now: string;
        export const ok: string;
    }
    export namespace Drawer {
        const okText: string;
        const cancelText: string;
    }
    export namespace Empty {
        const noData: string;
    }
    export namespace Modal {
        const okText_1: string;
        export { okText_1 as okText };
        const cancelText_1: string;
        export { cancelText_1 as cancelText };
    }
    export namespace Pagination {
        const goto: string;
        const page: string;
        const countPerPage: string;
        const total: string;
    }
    export namespace Popconfirm {
        const okText_2: string;
        export { okText_2 as okText };
        const cancelText_2: string;
        export { cancelText_2 as cancelText };
    }
    export namespace Table {
        const okText_3: string;
        export { okText_3 as okText };
        export const resetText: string;
        export const sortAscend: string;
        export const sortDescend: string;
        export const cancelSort: string;
    }
    export namespace TimePicker {
        const ok_1: string;
        export { ok_1 as ok };
        const placeholder_1: string;
        export { placeholder_1 as placeholder };
        const placeholders_1: string[];
        export { placeholders_1 as placeholders };
        const now_1: string;
        export { now_1 as now };
    }
    export namespace Progress {
        const success: string;
        const error: string;
    }
    export namespace Upload {
        export const start: string;
        export const cancel: string;
        const _delete: string;
        export { _delete as delete };
        export const reupload: string;
        export const upload: string;
        export const preview: string;
        export const drag: string;
        export const dragHover: string;
        const error_1: string;
        export { error_1 as error };
    }
    export namespace Typography {
        const copy: string;
        const copied: string;
        const edit: string;
        const fold: string;
        const unfold: string;
    }
    export namespace Transfer {
        const resetText_1: string;
        export { resetText_1 as resetText };
    }
    export namespace ImagePreview {
        const fullScreen: string;
        const rotateRight: string;
        const rotateLeft: string;
        const zoomIn: string;
        const zoomOut: string;
        const originalSize: string;
    }
}
export default _default;
declare namespace Calendar {
    export const formatYear: string;
    export const formatMonth: string;
    const today_1: string;
    export { today_1 as today };
    export namespace view {
        const month_2: string;
        export { month_2 as month };
        const year_2: string;
        export { year_2 as year };
        const week_2: string;
        export { week_2 as week };
        export const day: string;
    }
    export namespace month_3 {
        namespace long {
            const January: string;
            const February: string;
            const March: string;
            const April: string;
            const May: string;
            const June: string;
            const July: string;
            const August: string;
            const September: string;
            const October: string;
            const November: string;
            const December: string;
        }
        namespace short {
            const January_1: string;
            export { January_1 as January };
            const February_1: string;
            export { February_1 as February };
            const March_1: string;
            export { March_1 as March };
            const April_1: string;
            export { April_1 as April };
            const May_1: string;
            export { May_1 as May };
            const June_1: string;
            export { June_1 as June };
            const July_1: string;
            export { July_1 as July };
            const August_1: string;
            export { August_1 as August };
            const September_1: string;
            export { September_1 as September };
            const October_1: string;
            export { October_1 as October };
            const November_1: string;
            export { November_1 as November };
            const December_1: string;
            export { December_1 as December };
        }
    }
    export { month_3 as month };
    export namespace week_3 {
        export namespace long_1 {
            const self: string;
            const monday: string;
            const tuesday: string;
            const wednesday: string;
            const thursday: string;
            const friday: string;
            const saturday: string;
            const sunday: string;
        }
        export { long_1 as long };
        export namespace short_1 {
            const self_1: string;
            export { self_1 as self };
            const monday_1: string;
            export { monday_1 as monday };
            const tuesday_1: string;
            export { tuesday_1 as tuesday };
            const wednesday_1: string;
            export { wednesday_1 as wednesday };
            const thursday_1: string;
            export { thursday_1 as thursday };
            const friday_1: string;
            export { friday_1 as friday };
            const saturday_1: string;
            export { saturday_1 as saturday };
            const sunday_1: string;
            export { sunday_1 as sunday };
        }
        export { short_1 as short };
    }
    export { week_3 as week };
}
