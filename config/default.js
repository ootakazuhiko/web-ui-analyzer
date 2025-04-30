// config.js
// Web UI Analyzer テスト用設定ファイル

module.exports = {
  // ベースURL (テスト用)
  baseUrl: 'https://developer.mozilla.org/ja/', // MDN Web Docsのテスト用URL
  
  // 出力設定
  output: {
    // 出力ディレクトリ
    baseDir: './captures',
    
    // 収集するデータタイプ
    capture: {
      screenshot: true,
      html: true,
      styles: true,
      dom: true,
      accessibility: true
    },
    
    // 分析オプション
    analysis: {
      componentUsage: true,
      styleConsistency: true,
      accessibility: true,
      generateFlowDiagram: true
    }
  }
};