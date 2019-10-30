module.exports = {
    pagePerSection: true,
    sections:[
        {
            name: 'Documentação',
            sections: [
                {
                name: 'Anteros',
                components:'../anteros-react-buttons/src/components/[A-Z]*.jsx',
                //exampleMode: 'collapse',
                //usageMode:'collapse'
                }
            ],
            sectionDepth: 1,
        }],
   theme:{
       color:{
           link:'white',
           base:'#333',
           //linkHover:'',
           sidebarBackground:'#052B47',
           //codeBackground: 'blue'
           //ribbonBackground: 'blue',
           //ribbonText: 'red',
           //codeProperty: 'blue'
           //baseBackground: '#333',
           name:'blue',
           type:'purple'
       },
       sidebarWidth:300,
   },
   webpackConfig: {
    module: {
      rules: [
        // Babel loader will use your project’s babel.config.js
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        },
        // Other loaders that are needed for your components
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    }
  }
}