chartColors = {primary: '#5D92F4',
        secondary: '#677080',
        success: '#00D014',
        danger: '#FF3739',
        warning: '#FFB70F',
        info: '#00D0BD',
        dark: '#464D69',
        default: '#FAFAFA',
        greyLighten: '#A5A7B2', 
        grey: '#677080',
        white: '#FFFFFF',
        purple: '#896BD6',
        yellow: '#D46B08'
}
const ChartConfig = {
  color: {
    'primary': chartColors.primary,
    'info': chartColors.info,
    'warning': chartColors.warning,
    'danger': chartColors.danger,
    'success': chartColors.success,
    'default': '#DEE4E8',
    'purple': chartColors.purple,
    'secondary': chartColors.secondary,
    'yellow': chartColors.yellow,
    'white': '#FFFFFF',
    'dark': chartColors.white,
    'greyLighten': chartColors.greyLighten,
    'grey': chartColors.grey
  },
  legendFontColor: '#AAAEB3', 
  chartGridColor: '#EAEAEA',
  axesColor: '#657786',
  shadowColor: 'rgba(0,0,0,0.6)'
}


export const tooltipStyle = {
  backgroundColor: 'rgba(0,0,0,0.6)',
  border: '1px solid rgba(0,0,0,0.6)',
  borderRadius: '5px'
}

export const tooltipTextStyle = {
  color: '#FFF',
  fontSize: '12px',
  paddingTop: '5px',
  paddingBottom: '5px',
  lineHeight: '1'
}

export default AnterosChartsConfig;
