// layout-analysis-flow.js
// レイアウト分析に特化したワークフローサンプル

const path = require('path');
const { captureWorkflow } = require('../../src/capture/playwright');
const { runAnalysis } = require('../../src/analysis/analyze');

// サンプルWebアプリURL（実際のURLに変更してください）
const DEMO_WEBAPP_URL = 'https://getbootstrap.com/docs/5.0/examples/dashboard/';

/**
 * Webアプリケーションのレイアウト分析に特化したフローを実行します
 * このサンプルは、レイアウトの一貫性やコンポーネントの使用状況を効率的に分析するための
 * 手動操作ワークフローの例です
 */
async function runLayoutAnalysisFlow() {
  console.log('=== レイアウト分析特化ワークフローのサンプル実行 ===');
  console.log(`サイト: ${DEMO_WEBAPP_URL}`);
  
  // ワークフロー名
  const workflowName = 'layout_analysis_flow_' + 
    new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // レイアウト分析に最適化したブラウザ設定
    const options = {
      headless: false,
      viewportSize: { width: 1920, height: 1080 } // 大きな画面で詳細を表示
    };
    
    // ワークフロー実行
    const result = await captureWorkflow(DEMO_WEBAPP_URL, workflowName, options);
    
    if (result.success) {
      console.log(`\nレイアウト分析フローの収集が完了しました (${result.stepCount}ステップ)`);
      console.log(`データは ${result.outputDir} に保存されました`);
      
      // 分析実行
      await runAnalysis(result.outputDir);
      
      console.log('\n分析完了');
      console.log('\n===== レイアウト分析の視点 =====');
      console.log('1. color_usage.json を確認して、カラーパレットの一貫性を検証');
      console.log('2. font_size_usage.json を確認して、タイポグラフィの階層を検証');
      console.log('3. consistency_report.md でスタイルの一貫性の全体像を確認');
      console.log('4. component_usage.csv でUIコンポーネントの統計を確認');
      console.log('5. 各ステップの _layout.json ファイルで要素の配置情報を詳細に確認');
      console.log(`6. トレースビューアで視覚的に確認: npx playwright show-trace ${path.join(result.outputDir, 'trace.zip')}`);
    } else {
      console.error('ワークフローの実行中にエラーが発生しました:', result.error);
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// このスクリプトが直接実行された場合は実行する
if (require.main === module) {
  runLayoutAnalysisFlow().catch(console.error);
}

module.exports = { runLayoutAnalysisFlow };